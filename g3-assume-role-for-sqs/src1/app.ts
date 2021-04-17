//mport Axios from "axios";
//mport { aws4Interceptor } from "aws4-axios";
import {
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";
import * as AWS from "aws-sdk";

type Obj = { roleArn: string; queueUrl: string; msg: string };

function assumeRole(roleArn: string) {
  return new Promise((resolve, reject) => {
    const sts = new AWS.STS();
    const params = {
      RoleArn: roleArn,
      RoleSessionName: "demo-session",
      DurationSeconds: 900,
    };
    console.log("Trying to assume role with parameters");
    console.log(params);
    sts.assumeRole(params, function (err, data) {
      if (err) {
        console.log("Can't assume role");
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

  console.log("Sending message with parameters");
  console.log(params);

  // Create SQS service object
  const client = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: accessParams as any,
  });

  try {
    return await client.send(new SendMessageCommand(params));
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function lambdaHandler(event, context) {
  console.log(
    "Called first lambda via URL, now sending SQS message that is processed by the other lambda"
  );
  const body: Obj = JSON.parse(event.body);

  const status = await sendMessage(body);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  };
}
