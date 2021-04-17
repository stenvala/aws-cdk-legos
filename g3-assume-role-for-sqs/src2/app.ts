import * as aws from "aws-sdk";

export async function lambdaHandler(event, context) {
  console.log("Info called lambda via SQS with event");
  console.log(event);
  this.s3 = new aws.S3();

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: "temp.json",
    Body: JSON.stringify(event),
    ContentType: "application/json",
  };
  const putResult = await this.s3.putObject(params).promise();
  return putResult;
}
