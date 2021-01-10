import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as AS from "./auth-stack";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/amis/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "amis::Amis.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;
const PREFIX = "amis-";

export class AmisStack {
  lambda: lambda.Function;
  private authStack: AS.AuthStack;
  private stack: cdk.Stack;

  private readonly prefix: string;

  constructor(
    stack: cdk.Stack,
    prefix: string,
    authStack: AS.AuthStack,
    props: GlobalProps
  ) {
    this.stack = stack;
    this.authStack = authStack;

    this.prefix = prefix + PREFIX;
    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
      environment: {
        amisAuthType: props.amisAuth,
      },
    });
    switch (props.amisAuth) {
      case "lambda":
        this.withLambdaAuthorizer();
        break;
      case "api":
        this.withoutAuth();
        break;
      case "jwt":
        throw new Error("Not yet implemented");
      default:
        throw new Error("Invalid authentication type to amis");
    }
  }

  private withoutAuth() {
    const api = new apigw.LambdaRestApi(this.stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });
    new cdk.CfnOutput(this.stack, PREFIX + "Url", { value: api.url });
  }

  private withLambdaAuthorizer() {
    const integration = new apigw.LambdaIntegration(this.lambda, {
      proxy: true,
    });

    // Cors don't still work
    const api = new apigw.RestApi(this.stack, this.prefix + "ApiGw", {
      restApiName: "AMISAPI",
      description: "API for AMIS services.",
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
