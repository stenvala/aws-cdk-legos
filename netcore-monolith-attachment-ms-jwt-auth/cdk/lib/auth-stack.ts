import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { KEY } from "./key";

const ASSET_LOCATION = "../src/auth";
const LAYER_LOCATION = "../dist/auth";
const HANDLER = "authorizer.lambda_handler";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const PREFIX = "auth-";

export class AuthStack {
  lambda: lambda.Function;
  apigw: apigw.LambdaRestApi;
  layer: lambda.LayerVersion;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string) {
    this.prefix = prefix + PREFIX;

    this.layer = new lambda.LayerVersion(stack, this.prefix + "Layer", {
      code: lambda.Code.fromAsset(LAYER_LOCATION),
      compatibleRuntimes: [RUNTIME],
    });

    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY,
      },
      handler: HANDLER,
      layers: [this.layer],
    });

    this.apigw = new apigw.LambdaRestApi(stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    // AuthParam.grantRead(this.lambda);

    new cdk.CfnOutput(stack, this.prefix + "Url", { value: this.apigw.url });
  }
}
