import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.lambda();
  }

  private lambda() {
    const hello = new lambda.Function(this, "Ms1DemoHandler", {
      runtime: lambda.Runtime.NODEJS_12_X, // execution environment
      code: lambda.Code.fromAsset("../dist"), // code loaded from "../dist" directory
      handler: "app.httpHandler", // file is "app.js", function is "httpHandler",
    });

    // Wire lambda to api gateway
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
  }
}
