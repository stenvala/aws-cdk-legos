//mport Axios from "axios";
//mport { aws4Interceptor } from "aws4-axios";
import {
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as AWS from "aws-sdk";

function assumeRole() {
  return new Promise((resolve, reject) => {
    const sts = new AWS.STS();
    const params = {
      RoleArn: process.env.ROLE_ARN,
      RoleSessionName: "demo-session",
      DurationSeconds: 900,
    };
    console.log("Trying to assume role with params");
    console.log(params);
    sts.assumeRole(params, function (err, data) {
      if (err) {
        // an error occurred
        console.log("Cannot assume role");
        console.log(err, err.stack);
        resolve(false);
      } else {
        console.log("Assumed role sucessfully");
        // successful response
        resolve({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        });
      }
    });
  });
}

async function sendMessage() {
  const accessParams = await assumeRole();
  if (!accessParams) {
    console.error(
      "Can't set role, thus can't send a message but not quitting now"
    );
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/plain" },
      body: "Unauthorized",
    };
  }
  console.log("Role set correctly");
  // Set the parameters
  const params: SendMessageCommandInput = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({ hello: "world" }),
    QueueUrl: process.env.QUEUE_URL,
  };

  // Create SQS service object
  const client = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: accessParams as any,
  });
  // async/await.
  try {
    const data = await client.send(new SendMessageCommand(params));
    // process data
  } catch (error) {
    console.log(error);
    return error;
  }
  return true;
}

export async function lambdaHandler(event, context) {
  console.log(event);
  console.log(
    "Called first lambda via URL, now sending SQS message that is picked by the other lambda"
  );

  const status = await sendMessage();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  };
}
