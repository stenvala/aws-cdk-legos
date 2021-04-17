import * as aws from "aws-sdk";

export async function lambdaHandler(event, context) {
  console.log("Called lambda via SQS with event", event);

  this.s3 = new aws.S3();
  const body = event.Records[0].body;

  console.log("Found body", body);

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: "temp.json",
    Body: body,
    ContentType: "application/json",
  };

  // Add a little delay here, just to demostrate that handling can take time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Save message to S3 after delay of 1 s");
  const putResult = await this.s3.putObject(params).promise();

  return putResult;
}
