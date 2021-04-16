import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import { addCorsOptions } from "./add-cors-options";
import * as A from "./auth";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/demo-auth";
const HANDLER = "app.handler";
const RUNTIME = lambda.Runtime.NODEJS_12_X;

const PREFIX = "demoAuth-";

export class DemoAuth {
  private lambda: lambda.Function;
  private authStack: A.Auth;
  private stack: cdk.Stack;
  apigw: apigw.RestApi;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, authStack: A.Auth, props: GlobalProps) {
    this.stack = stack;
    this.authStack = authStack;

    this.lambda = new lambda.Function(stack, PREFIX + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
      timeout: cdk.Duration.seconds(30) as any,
      memorySize: 128,
      logRetention: log.RetentionDays.ONE_DAY,
    });
    this.withLambdaAuthorizer();
  }

  private withLambdaAuthorizer() {
    const integration = new apigw.LambdaIntegration(this.lambda, {
      proxy: true,
    });

    // Cors don't still work
    this.apigw = new apigw.RestApi(this.stack, PREFIX + "ApiGw", {
      restApiName: PREFIX + "ApiGw",
    });

    const res = this.apigw.root.addProxy({
      anyMethod: false,
      defaultIntegration: integration,
    });

    const opts = {
      apiKeyRequired: false,
      authorizationType: apigw.AuthorizationType.CUSTOM,
      authorizer: this.authStack.auth,
    };

    res.addMethod("GET", undefined, opts);
    res.addMethod("POST", undefined, opts);
    res.addMethod("PUT", undefined, opts);
    res.addMethod("DELETE", undefined, opts);

    addCorsOptions(res);

    new cdk.CfnOutput(this.stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
