import * as aws from "aws-sdk";

export class S3Service {
  private readonly s3: aws.S3;

  constructor() {
    this.s3 = new aws.S3();
  }

  async getJsonFromBucket(bucketName: string, location: string) {
    try {
      const params = {
        Bucket: bucketName,
        Key: location,
      };
      const obj = await this.s3.getObject(params).promise();
      return JSON.parse(obj.Body.toString());
    } catch (error) {
      return error;
    }
  }

  async addJsonToBucket(bucketName: string, location: string, json: any) {
    try {
      const params = {
        Bucket: bucketName,
        Key: location,
        Body: JSON.stringify(json),
        ContentType: "application/json",
      };
      const putResult = await this.s3.putObject(params).promise();
      return putResult;
    } catch (error) {
      return error;
    }
  }

  async removeFromBucket(bucketName: string, location: string) {
    try {
      const params = {
        Bucket: bucketName,
        Key: location,
      };
      await this.s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      return error;
    }
  }
}
