//mport Axios from "axios";
//mport { aws4Interceptor } from "aws4-axios";
import * as AWS from "aws-sdk";
import {
  SQSClient,
  AddPermissionCommand,
  SendMessageCommand,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";
import { SendMessageRequest } from "aws-sdk/clients/sqs";

//AWS.config.update({ region: process.env.AWS_REGION });

function assumeRole(): Promise<boolean> {
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
        // successful response
        AWS.config.update({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        });
        resolve(true);
      }
    });
  });
}

async function sendMessage() {
  const isRoleSet = await assumeRole();
  if (!isRoleSet) {
    console.error("Can't set role");
    return;
  }
  console.log("Role set correctly");
  // Set the parameters
  const params: SendMessageCommandInput = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({ hello: "world" }),
    QueueUrl: process.env.QUEUE_URL,
  };

  // Create SQS service object
  const client = new SQSClient({ region: process.env.AWS_REGION });

  // async/await.
  try {
    const data = await client.send(new SendMessageCommand(params));
    // process data.
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}

export async function lambdaHandler(event, context) {
  console.log(
    "Called first lambda via URL, now sending SQS message that is picked by the other lambda"
  );

  const status = await sendMessage();

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ status }),
  };
}
