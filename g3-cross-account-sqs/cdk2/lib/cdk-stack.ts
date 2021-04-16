import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as sqs from "@aws-cdk/aws-sqs";
import { Duration } from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "Queue", {
      visibilityTimeout: Duration.seconds(30), // default,
    });

    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist2"),
      handler: "app.lambdaHandler",
    });

    fun.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 1,
      })
    );

    // This is the role for sending to SQS
    const policyStatement = new iam.PolicyStatement({
      resources: [queue.queueArn],
      effect: iam.Effect.ALLOW,
      actions: ["sqs:SendMessage"],
    });

    const policy = new iam.Policy(this, "Policy", {
      statements: [policyStatement],
    });

    // Might be that we don't need role, but policy would be enough
    const roleName = "SQSSendMessageRole";

    const role = new iam.Role(this, roleName, {
      //assumedBy: new iam.ServicePrincipal("sqs.amazonaws.com"),
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    role.attachInlinePolicy(policy);

    new cdk.CfnOutput(this, "queueUrl", { value: queue.queueUrl });
    new cdk.CfnOutput(this, "roleArn", { value: role.roleArn });
  }
}
