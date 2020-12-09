import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

// This is the url of the second lambda
const HOST = "7c53dspx0i.execute-api.eu-north-1.amazonaws.com";
const LAMBDA = `https://${HOST}/prod/`;

export class TsHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fun = new lambda.Function(this, "IamLambdaHandler1", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "app.lambdaHandler1",
      environment: {
        LAMBDA,
        HOST,
      },
    });

    // API Gateway
    const gw = new apigw.LambdaRestApi(this, "Endpoint1", {
      handler: fun,
      proxy: true,
    });
  }
}
