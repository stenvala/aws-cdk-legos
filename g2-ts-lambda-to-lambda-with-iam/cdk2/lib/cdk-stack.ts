import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler2",
    });

    const apiGW = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      proxy: true,
      options: {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.IAM,
        },
      },
    });

    new cdk.CfnOutput(this, "url", { value: apiGW.url });
    new cdk.CfnOutput(this, "apiGwArn", { value: apiGW.arnForExecuteApi() });
  }
}
