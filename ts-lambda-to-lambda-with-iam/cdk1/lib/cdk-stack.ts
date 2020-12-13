import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

// Get url of second lambda
function getUrl() {
  try {
    const data = fs.readFileSync("../cdk2/output.json", "utf8");
    return JSON.parse(data)["Lambda2LambdaPart2"]["PrivateUrl"];
  } catch (error) {
    return "NOT_AVAILABLE";
  }
}

export class Lambda1Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const url = getUrl();
    console.log(`Has private url ${url}`);
    const fun = new lambda.Function(this, "IamLambdaHandler1", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "app.lambdaHandler1",
      environment: {
        LAMBDA: url,
      },
    });

    // API Gateway
    const gw = new apigw.LambdaRestApi(this, "Endpoint1", {
      handler: fun,
      proxy: true,
    });

    // Save these outputs
    new cdk.CfnOutput(this, "RoleArn", { value: fun.role!.roleArn });
    new cdk.CfnOutput(this, "PublicUrl", { value: gw.url });
  }
}
