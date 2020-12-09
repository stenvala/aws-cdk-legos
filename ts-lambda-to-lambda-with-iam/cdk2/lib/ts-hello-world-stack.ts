import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import { pid } from "process";

export class TsHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const name = new lambda.Function(this, "HelloWorldHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler2",
    });

    // API Gateway

    const integration = new apigw.LambdaIntegration(name);

    const apiGW = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: name,
      proxy: true,
      options: {},
    });

    new apigw.CfnAuthorizer(this, "IAMAuthorizer", {
      restApiId: apiGW.restApiId,
      type: apigw.AuthorizationType.IAM,
    });

    const lambda1RoleArn =
      "arn:aws:iam::364632538942:role/TsHelloWorldStack-HelloWorldHandlerServiceRole56E6-IX9B9PQMY373";
    const iamUser = new iam.ArnPrincipal(lambda1RoleArn);

    const policyStatement = new iam.PolicyStatement({
      resources: [apiGW.restApiRootResourceId],
      actions: ["lambda:InvokeFunction"],
    });

    iamUser.addToPolicy(policyStatement);
  }
}
