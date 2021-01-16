import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";
import * as A from "./auth";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/amis/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "amis::Amis.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;
const PREFIX = "amis-";
const BUCKET_NAME = "amis-document-data";

export class Amis {
  lambda: lambda.Function;
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
      timeout: cdk.Duration.seconds(30),
      environment: {
        authType: props.amisAuth,
        authUrl: authStack.apigw.url + "decode",
        bucket: BUCKET_NAME,
      },
      memorySize: 512,
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

  private initBucket() {
    const bucket = new s3.Bucket(this.stack, this.prefix + "Bucket", {
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
