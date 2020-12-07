import { S3Service } from "./s3.service";

export class IntegratorService {
  constructor(private s3: S3Service) {}

  async getPresignedUrl() {
    return await this.s3.getPresignData(process.env.BUCKET_NAME);
  }

  async getData(path: string) {
    // Here get from Se
    return await this.s3.removeFromBucket(process.env.BUCKET_NAME, path);
  }

  async fromS3ToDynamo() {}
}
