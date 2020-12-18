import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

const PREFIX = "CsharpAurora-"

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const name = new lambda.Function(this, PREFIX + "Lambda",
    {
      runtime: lambda.Runtime.DOTNET_CORE_3_1,
      code: lambda.Code.fromAsset("../src/bin/Release/netcoreapp3.1/linux-x64"),
      handler: "csharp-aurora::csharp_aurora.LambdaEntryPoint::FunctionHandlerAsync",
    });
   
    const api = new apigw.LambdaRestApi(this, PREFIX + "ApiGw", 
    {
      handler: name,
      proxy: true,
    });
    
    new cdk.CfnOutput(this, "url", { value: api.url });
    
  }
}
