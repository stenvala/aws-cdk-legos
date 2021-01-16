import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
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

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string, props: GlobalProps) {
    this.prefix = prefix + PREFIX;

    this.layer = new lambda.LayerVersion(stack, this.prefix + "Layer", {
      code: lambda.Code.fromAsset(LAYER_LOCATION),
      compatibleRuntimes: [RUNTIME],
    });

    this.lambda = new lambda.Function(stack, this.prefix + "ApiLambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY,
      },
      handler: HANDLER,
      layers: [this.layer],
      memorySize: 512,
    });

    this.apigw = new apigw.LambdaRestApi(stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    if (props.amisAuth === "lambda") {
      this.authLambda = new lambda.Function(
        stack,
        this.prefix + "AuthorizerLambda",
        {
          runtime: RUNTIME,
          code: lambda.Code.fromAsset(ASSET_LOCATION),
          handler: AUTH_HANDLER,
          layers: [this.layer],
        }
      );

      this.auth = new apigw.TokenAuthorizer(stack, this.prefix + "Authorizer", {
        identitySource: "method.request.header.Authorization",
        validationRegex: "^Bearer\\s(.*)",
        authorizerName: "CustomJWTAuthorizer",
        handler: this.authLambda,
      });
    }

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
