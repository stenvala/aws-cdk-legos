import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/auth";
const LAYER_LOCATION = "../dist/auth";
const HANDLER = "api.lambda_handler";
const AUTH_HANDLER = "authorizer.lambda_handler";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const PREFIX = "auth-";
const ISSUER = "AMIS_AUTH";

export const KEY_PREFIX = "Key/AmisAuth";
export const KEY = `/${KEY_PREFIX}/Secret`;

export class Auth {
  lambda: lambda.Function;
  authLambda: lambda.Function;
  apigw: apigw.LambdaRestApi;
  layer: lambda.LayerVersion;
  auth: apigw.TokenAuthorizer;

  constructor(private stack: cdk.Stack, props: GlobalProps) {
    this.layer = new lambda.LayerVersion(stack, PREFIX + "Layer", {
      code: lambda.Code.fromAsset(LAYER_LOCATION),
      compatibleRuntimes: [RUNTIME],
    });

    this.lambda = new lambda.Function(stack, PREFIX + "ApiLambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY,
        AWS: "true",
        ISSUER,
      },
      handler: HANDLER,
      layers: [this.layer],
      memorySize: 256,
      reservedConcurrentExecutions: props.maxConcurrency,
      logRetention: log.RetentionDays.ONE_DAY,
    });
    this.allowToAccessParameterStore(this.lambda);

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
          environment: {
            KEY,
            AWS: "true",
            ISSUER,
          },
          layers: [this.layer],
          reservedConcurrentExecutions: props.maxConcurrency,
        }
      );
      this.allowToAccessParameterStore(this.authLambda);

      this.auth = new apigw.TokenAuthorizer(stack, PREFIX + "Authorizer", {
        identitySource: "method.request.header.Authorization",
        validationRegex: "^Bearer\\s(.*)",
        authorizerName: "JWTAuthorizerOfAmis",
        handler: this.authLambda,
      });
    }
    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }

  private allowToAccessParameterStore(fun: lambda.Function) {
    const region = this.stack.region;
    fun.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:GetParametersByPath"],
        resources: [
          "arn:aws:s3:::*",
          `arn:aws:ssm:${region}:*:parameter/${KEY_PREFIX}/*`,
        ],
      })
    );
  }
}
