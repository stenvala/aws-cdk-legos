import * as apigw from "@aws-cdk/aws-apigateway";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import * as A from "./auth";
import { DELETE_EVENT_BUS_NAME, GlobalProps } from "./models";

const ASSET_LOCATION = "../src/amis/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "amis::Amis.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;

const DELETER_LOCATION = "../src/amis-delete-doc/dist";
const DELETER_HANDLER = "main.lambdaHandler";
const DELETER_RUNTIME = lambda.Runtime.NODEJS_12_X;

const PREFIX = "amis-";
const BUCKET_NAME = "amis-document-data";

export class Amis {
  lambda: lambda.Function;
  deleteLambda: lambda.Function;
  eventBus: events.EventBus;
  apigw: apigw.LambdaRestApi;
  private authStack: A.Auth;
  private stack: cdk.Stack;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, authStack: A.Auth, private props: GlobalProps) {
    this.stack = stack;
    this.authStack = authStack;
    this.deleter(stack);

    this.lambda = new lambda.Function(stack, PREFIX + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
      timeout: cdk.Duration.seconds(30) as any,
      environment: {
        authType: props.amisAuth,
        authUrl:
          (props.useCustomDomainName
            ? props.customDomainNameFactory!.getUrl("auth")
            : authStack.apigw.url) + "decode",
        bucket: BUCKET_NAME,
      },
      memorySize: 512,
      reservedConcurrentExecutions: props.maxConcurrency,
      logRetention: log.RetentionDays.ONE_DAY,
    });
    this.initBucket();
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

  private deleter(stack: cdk.Stack) {
    this.deleteLambda = new lambda.Function(stack, PREFIX + "DELETE_Lambda", {
      runtime: DELETER_RUNTIME,
      code: lambda.Code.fromAsset(DELETER_LOCATION),
      handler: DELETER_HANDLER,
      environment: {
        bucketName: BUCKET_NAME,
      },
      reservedConcurrentExecutions: this.props.maxConcurrency,
    });

    this.eventBus = new events.EventBus(stack, PREFIX + "ProfileEventBus", {
      eventBusName: DELETE_EVENT_BUS_NAME,
    });

    const rule = new events.Rule(stack, PREFIX + "NewRule", {
      description: "Delete document",
      eventPattern: {
        source: ["mono.deleteDocument"],
      },
      eventBus: this.eventBus,
    });
    rule.addTarget(new targets.LambdaFunction(this.deleteLambda));
  }

  private initBucket() {
    const bucket = new s3.Bucket(this.stack, PREFIX + "Bucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [s3.HttpMethods.PUT],
        },
      ],
    });
    bucket.grantReadWrite(this.lambda);
    bucket.grantReadWrite(this.deleteLambda);
  }

  private withoutAuth() {
    this.apigw = new apigw.LambdaRestApi(this.stack, PREFIX + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });
    new cdk.CfnOutput(this.stack, PREFIX + "Url", { value: this.apigw.url });
  }

  private withLambdaAuthorizer() {
    const integration = new apigw.LambdaIntegration(this.lambda, {
      proxy: true,
    });

    // Cors don't still work
    this.apigw = new apigw.RestApi(this.stack, PREFIX + "ApiGw", {
      restApiName: PREFIX + "ApiGW",
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
    this.apigw.root.addProxy();

    new cdk.CfnOutput(this.stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
