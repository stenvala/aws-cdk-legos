//mport Axios from "axios";
//mport { aws4Interceptor } from "aws4-axios";
//import * as AWS from "aws-sdk";
import {
  SQSClient,
  AddPermissionCommand,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

//AWS.config.update({ region: process.env.AWS_REGION });

const ROLE_TO_ASSUME = {
  RoleArn: process.env.ROLE_ARN,
  RoleSessionName: "session1",
  DurationSeconds: 100,
};

/*
const STS = new AWS.STS({ apiVersion: "2011-06-15" });

function stsGetCallerIdentity(creds) {
  const stsParams = {credentials: creds };
  // Create STS service object
  const sts = new AWS.STS(stsParams);
      
  sts.getCallerIdentity({}, function(err, data) {
      if (err) {
          console.log(err, err.stack);
      }
      else {
          console.log(data.Arn);
      }
  });    

function sendMessage() {
  // Create the STS service object    

  //Assume Role
  STS.assumeRole(ROLE_TO_ASSUME, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    }
    else {
      const roleCreds = {
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
      };
      stsGetCallerIdentity(roleCreds);

      const client = Axios.create();

      const interceptor = aws4Interceptor({
        region: process.env.AWS_REGION,
        service: "execute-api",      

      });

    client.interceptors.request.use(interceptor);

      }
  });
}
*/

async function sendMessage() {
  // Set the parameters
  const params = {
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
    // error handling.
  } finally {
    // finally.
  }
}

export async function lambdaHandler(event, context) {
  console.log(
    "Called first lambda via URL, now sending SQS message that is picked by the other lambda"
  );

  await sendMessage();

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: "OK",
  };
}
