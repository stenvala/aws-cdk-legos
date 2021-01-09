import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as AS from "./auth-stack";

const ASSET_LOCATION = "../src/amis/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "amis::Amis.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;
const PREFIX = "amis-";

export class AmisStack {
  lambda: lambda.Function;
  apigw: apigw.LambdaRestApi;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string, authStack: AS.AuthStack) {
    this.prefix = prefix + PREFIX;
    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
    });

    const integration = new apigw.LambdaIntegration(this.lambda, {
      proxy: true,
    });

    // https://stackoverflow.com/questions/52726914/aws-cdk-user-pool-authorizer/61843635#61843635
    const api = new apigw.RestApi(stack, this.prefix + "ApiGw", {
      restApiName: "Just some name",
      description: "API for journey services.",
      deployOptions: {
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
      },
      defaultIntegration: integration,
      defaultMethodOptions: {
        apiKeyRequired: false,
        authorizationType: apigw.AuthorizationType.CUSTOM,
        authorizer: authStack.auth,
      },
    });

    api.root.addProxy();

    /*
    const resource = api.root.addResource("/{proxy+}");
    resource.addMethod("ANY", integration, {
      apiKeyRequired: false,
      authorizationType: apigw.AuthorizationType.CUSTOM,
      authorizer: authStack.auth,      
    });
    /*
    api.root.addMethod("POST", integration, {
      authorizationType: apigw.AuthorizationType.CUSTOM,
      authorizer: authStack.auth,
    });
    */

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: api.url });

    /*
    const postMethod = post.node.defaultChild as apigw.CfnMethod;
    postMethod.addOverride("Properties.AuthorizerId", { Ref: auth.logicalId });
    */

    /*
    const authorizer = new apigw.CfnAuthorizer(
      stack,
      this.prefix + "JWTAuthorizer",
      {        
        authType: "JWT",
        restApiId: authStack.apigw.restApiId,
        type: "TOKEN", // HAS TO BE JWT FOR HTTP APIs !?!
        identitySource: "$request.header.Authorization",
        name: "my-authorizer",
        authorizerUri: authStack.apigw.url + "auth",
        jwtConfiguration: {
        issuer: "https://martzcodes.us.auth0.com/",
        audience: ["https://martzcodes.us.auth0.com/api/v2/"],
      },
      }
    );

    this.apigw = new apigw.LambdaRestApi(stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
      options: {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.CUSTOM,
          authorizer: authorizer,
        },
      },
    });
    */

    //new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
