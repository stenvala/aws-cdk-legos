import * as aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

export class S3Service {
  private readonly s3: aws.S3;

  constructor() {
    this.s3 = new aws.S3();
  }

  async getPresignData(bucketName: string) {
    const userid = uuidv4();
    try {
      // default expiration in 1 h
      const params = {
        Bucket: bucketName,        
        Conditions: [
          ["content-length-range", 0, 1000000],
          ["starts-with", "$key", "trigger/"],          
          ["eq", "$x-amz-meta-userid", userid],
        ],
      };
      const obj = this.s3.createPresignedPost(params);
      obj.fields["x-amz-meta-userid"] = userid;
      return Promise.resolve(obj);
    } catch (error) {
      return Promise.resolve(error);
    }
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
