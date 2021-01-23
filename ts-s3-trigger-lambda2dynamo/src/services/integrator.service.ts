import { DynamoService } from "./dynamo.service";
import { S3Service } from "./s3.service";

export class IntegratorService {
  constructor(private s3: S3Service, private dynamo: DynamoService) {}

  async getPresignedUrl() {
    return await this.s3.getPresignData(process.env.BUCKET_NAME);
  }

  async getData(path: string) {
    const data = await this.dynamo.get(path);
    await this.dynamo.del(path);
    return data;
  }

  async fromS3ToDynamo(path: string) {
    console.info(`Start reading from ${process.env.BUCKET_NAME} key ${path}`);
    const data = await this.s3.getJsonFromBucket(process.env.BUCKET_NAME, path);
    console.info("Read from S3", data);
    await this.dynamo.add(path, data);
    console.info("Added to dynamo");
    await this.s3.removeFromBucket(process.env.BUCKET_NAME, path);
    console.info("Removed from S3");
  }

  static async S3EventHandler(event, context) {
    console.info("In step handler");
    const service = new IntegratorService(new S3Service(), new DynamoService());
    const record = event.Records[0];    
    console.log("Found record", record.s3);
    const path = record.s3.object.key;
    await service.fromS3ToDynamo(path);
  }
}
