import {
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as AWS from "aws-sdk";

type Obj = { roleArn: string; queueUrl: string; msg: string };

const STS = new AWS.STS();

function assumeRole(roleArn: string) {
  return new Promise((resolve, reject) => {
    const params = {
      RoleArn: roleArn,
      RoleSessionName: "demo-session",
      DurationSeconds: 900,
    };
    console.log("Trying to assume role with parameters", params);
    STS.assumeRole(params, function (err, data) {
      if (err) {
        console.log("Couldn't assume role");
        console.log(err, err.stack);
        resolve(false);
      } else {
        console.log("Assumed role sucessfully");
        resolve({
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        });
      }
    });
  });
}

async function sendMessage(obj: Obj) {
  console.log("Sending message with parameters", obj);
  const accessParams = await assumeRole(obj.roleArn);
  if (!accessParams) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "text/plain" },
      body: "Unauthorized",
    };
  }

  // Set the parameters
  const params: SendMessageCommandInput = {
    DelaySeconds: 10,
    MessageBody: JSON.stringify({ msg: obj.msg }),
    QueueUrl: obj.queueUrl,
  };

  console.log("Sending message with parameters", params);

  // Create SQS service object
  const client = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: accessParams as any, // without this, the role of the lambda is used and it doesn't have permission to send message to SQS
  });

  try {
    return await client.send(new SendMessageCommand(params));
  } catch (error) {
    console.log("Failed to send message", error);
    return error;
  }
}

/**
 * In reality we would use here express via serverless (in case of REST API), but for the sake of demonstrating,
 * let's keep this simple. This will result in 500 for get requests and is pretty much usable
 * only by the demo client.
 */
export async function lambdaHandler(event, context) {
  console.log(
    "Called lambda with http request, now 1) assuming role 2) sending SQS message to given target"
  );
  const body: Obj = JSON.parse(event.body);
  const status = await sendMessage(body);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  };
}
