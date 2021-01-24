import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

const PREFIX = "TSLambda2Lambda2-"

// Get role of first lambda
function getRoleArn() {
  const data = fs.readFileSync("../cdk1/stack-data.json", "utf8");
  return JSON.parse(data)["TSLambda2Lambda1-Stack"]["roleArn"];
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const fun = new lambda.Function(this, PREFIX + "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler2",
    });

    const apiGW = new apigw.LambdaRestApi(this, PREFIX + "ApiGw", {
      handler: fun,
      proxy: true,
      options: {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.IAM,
        },
      },
    });

    // This is the role of the other lambda
    const iamRole = iam.Role.fromRoleArn(this, PREFIX + "Role", getRoleArn());

    // This policy statement allows to invoice lambda via API GW with the other role
    const policyStatement = new iam.PolicyStatement({
      resources: [apiGW.arnForExecuteApi()],
      effect: iam.Effect.ALLOW,
      actions: ["execute-api:Invoke"],
    });

    const policy = new iam.Policy(this, PREFIX + "Policy", {
      statements: [policyStatement],
    });

    iamRole.attachInlinePolicy(policy);

    new cdk.CfnOutput(this, "url", { value: apiGW.url });
  }
}
