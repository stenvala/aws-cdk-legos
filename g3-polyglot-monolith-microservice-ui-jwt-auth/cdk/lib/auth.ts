import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import { KEY } from "./key";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/auth";
const LAYER_LOCATION = "../dist/auth";
const HANDLER = "api.lambda_handler";
const AUTH_HANDLER = "authorizer.lambda_handler";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const PREFIX = "auth-";

export class Auth {
  lambda: lambda.Function;
  authLambda: lambda.Function;
  apigw: apigw.LambdaRestApi;
  layer: lambda.LayerVersion;
  auth: apigw.TokenAuthorizer;

  constructor(stack: cdk.Stack, props: GlobalProps) {
    this.layer = new lambda.LayerVersion(stack, PREFIX + "Layer", {
      code: lambda.Code.fromAsset(LAYER_LOCATION),
      compatibleRuntimes: [RUNTIME],
    });

    this.lambda = new lambda.Function(stack, PREFIX + "ApiLambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY,
      },
      handler: HANDLER,
      layers: [this.layer],
      memorySize: 512,
      reservedConcurrentExecutions: props.maxConcurrency,
      logRetention: log.RetentionDays.ONE_DAY,
    });

    this.apigw = new apigw.LambdaRestApi(stack, PREFIX + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    if (props.amisAuth === "lambda" || props.amisAuth === "demo") {
      this.authLambda = new lambda.Function(
        stack,
        PREFIX + "AuthorizerLambda",
        {
          runtime: RUNTIME,
          code: lambda.Code.fromAsset(ASSET_LOCATION),
          handler: AUTH_HANDLER,
          layers: [this.layer],
          reservedConcurrentExecutions: props.maxConcurrency,
        }
      );

      this.auth = new apigw.TokenAuthorizer(stack, PREFIX + "Authorizer", {
        identitySource: "method.request.header.Authorization",
        validationRegex: "^Bearer\\s(.*)",
        authorizerName: "CustomJWTAuthorizer",
        handler: this.authLambda,
      });
    }

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
