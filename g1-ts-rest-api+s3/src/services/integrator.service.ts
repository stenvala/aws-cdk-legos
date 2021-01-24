import { S3AddRequest } from "../models/request.models";
import { S3Service } from "./s3.service";

export class IntegratorService {
  constructor(private s3: S3Service) {}

  async getFile(path: string) {
    return await this.s3.getJsonFromBucket(process.env.BUCKET_NAME, path);
  }

  async addFile(request: S3AddRequest) {
    return await this.s3.addJsonToBucket(
      process.env.BUCKET_NAME,
      request.path,
      request.data
    );
  }

  async removeFile(path: string) {
    return await this.s3.removeFromBucket(process.env.BUCKET_NAME, path);
  }
}
