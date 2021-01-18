import * as aws from "aws-sdk";

export class S3Service {
  private readonly s3: aws.S3;

  constructor() {
    this.s3 = new aws.S3();
  }
}

export async function lambdaHandler(event, context) {
  console.log(event);
  /*
  this.s3 = new aws.S3();
  const params = {
    Bucket: process.env.bucketName,
    Key: location,
  };
  await this.s3.deleteObject(params).promise();
  */

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/json" },
    body: JSON.stringify({
      msg: "Hello world!",
      event,
      context,
      env: process.env,
    }),
  };
}
