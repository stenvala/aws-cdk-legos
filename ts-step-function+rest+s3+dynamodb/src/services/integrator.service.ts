import { DynamoService } from "./dynamo.service";
import { S3Service } from "./s3.service";

export class IntegratorService {
  constructor(private s3: S3Service, private dynamo: DynamoService) {}

  async getPresignedUrl() {
    return await this.s3.getPresignData(process.env.BUCKET_NAME);
  }

  async getData(path: string) {
    return this.dynamo.get(path);
  }

  async fromS3ToDynamo(path: string) {
    const data = await this.s3.getJsonFromBucket(process.env.BUCKET_NAME, path);
    console.info("Read from S3", data);
    await this.dynamo.add(path, data);
    console.info("Added to dynamo");
    await this.s3.removeFromBucket(process.env.BUCKET_NAME, path);
    console.info("Removed from S3");
  }
}
