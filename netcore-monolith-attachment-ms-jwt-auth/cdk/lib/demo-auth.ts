import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import * as A from "./auth";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/demo-auth";
const HANDLER = "app.handler";
const RUNTIME = lambda.Runtime.NODEJS_12_X;

const PREFIX = "demoAuth";

export class DemoAuth {
  private lambda: lambda.Function;
  private authStack: A.Auth;
  private stack: cdk.Stack;

  private readonly prefix: string;

  constructor(
    stack: cdk.Stack,
    prefix: string,
    authStack: A.Auth,
    props: GlobalProps
  ) {
    this.stack = stack;
    this.authStack = authStack;

    this.prefix = prefix + PREFIX;
    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
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
    const api = new apigw.RestApi(this.stack, this.prefix + "ApiGw", {
      restApiName: "AMISAPI",
      /*
      deployOptions: {
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      */
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowCredentials: true,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ["*"],
      },
      defaultIntegration: integration,
      defaultMethodOptions: {
        apiKeyRequired: false,
        authorizationType: apigw.AuthorizationType.CUSTOM,
        authorizer: this.authStack.auth,
      },
    });

    // This is crucial!
    api.root.addProxy();

    new cdk.CfnOutput(this.stack, PREFIX + "Url", { value: api.url });
  }
}
