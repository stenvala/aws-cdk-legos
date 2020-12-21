import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { AuthParam, KEY } from "./key";

const ASSET_LOCATION = "../src/auth";
const HANDLER = "authorizer.lambda_handler";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const PREFIX = "auth-";

export class AuthStack {
  lambda: lambda.Function;
  apigw: apigw.LambdaRestApi;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string) {
    this.prefix = prefix + PREFIX;

    this.lambda = new lambda.Function(stack, PREFIX + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY,
      },
      handler: HANDLER,
    });

    this.apigw = new apigw.LambdaRestApi(stack, PREFIX + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    AuthParam.grantRead(this.lambda);

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
