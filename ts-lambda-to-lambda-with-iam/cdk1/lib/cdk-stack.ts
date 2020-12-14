import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

const PREFIX = "TSLambda2Lambda1-"

// Get url of second lambda
function getUrl() {
  try {
    const data = fs.readFileSync("../cdk2/stack-data.json", "utf8");
    return JSON.parse(data)["TSLambda2Lambda2-Stack"]["url"];
  } catch (error) {
    return "NOT_AVAILABLE";
  }
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);
    const url = getUrl();
    console.log(`Private url set to environment variable LAMBDA ${url}`);    
    const fun = new lambda.Function(this, PREFIX + "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler1",
      environment: {
        LAMBDA: url,        
      },
    });
    
    const gw = new apigw.LambdaRestApi(this, PREFIX + "ApiGw", {
      handler: fun,
      proxy: true,
    });

    // Save these outputs
    new cdk.CfnOutput(this, "roleArn", { value: fun.role!.roleArn });
    new cdk.CfnOutput(this, "url", { value: gw.url });
  }
}
