import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as log from "@aws-cdk/aws-logs";
import * as s3 from "@aws-cdk/aws-s3";
import * as sqs from "@aws-cdk/aws-sqs";
import * as cdk from "@aws-cdk/core";
import { Duration } from "@aws-cdk/core";
import * as fs from "fs";

const BUCKET_NAME = "sqs-assume-temp-bucket";

function getRoleArn() {
  const data = fs.readFileSync("../cdk1/stack-data.json", "utf8");
  const obj = JSON.parse(data);
  for (let i in obj) {
    return obj[i]["lambdaRoleArn"];
  }
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "Queue", {
      visibilityTimeout: Duration.seconds(30), // default
    });

    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist2"),
      handler: "app.lambdaHandler",
      logRetention: log.RetentionDays.ONE_DAY,
      environment: {
        BUCKET_NAME,
      },
    });

    // Trigger lambda from SQS
    fun.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 1,
      })
    );

    // Create role that must be assumed to be able to send message to SQS
    const policyStatement = new iam.PolicyStatement({
      resources: [queue.queueArn],
      effect: iam.Effect.ALLOW,
      actions: ["sqs:SendMessage"],
    });

    const policy = new iam.Policy(this, "Policy", {
      statements: [policyStatement],
    });

    const role = new iam.Role(this, "SQSSendMessageRole", {
      // This tells who can assume this role, use iam.CompositePrincipal for multiple roles that can assume this
      assumedBy: new iam.ArnPrincipal(getRoleArn()),
    });
    role.attachInlinePolicy(policy);

    // Add S3 bucket for writing the S3 file
    const bucket = new s3.Bucket(this, "Bucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(fun);

    new cdk.CfnOutput(this, "queueUrl", { value: queue.queueUrl });
    new cdk.CfnOutput(this, "roleArn", { value: role.roleArn });
    new cdk.CfnOutput(this, "bucketName", { value: BUCKET_NAME });
  }
}
