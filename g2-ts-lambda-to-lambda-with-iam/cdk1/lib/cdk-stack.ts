import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

function getData() {
  const data = fs.readFileSync("../cdk2/stack-data.json", "utf8");
  const parsed = JSON.parse(data);
  for (let i in parsed) {
    return parsed[i];
  }
  return {};
}

// Get url of second lambda
function getUrl() {
  return getData()["url"];
}

// Get role of first lambda
function getApiGwArn() {
  return getData()["apiGwArn"];
}

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const url = getUrl();
    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler1",
      environment: {
        LAMBDA: url,
      },
    });

    const gw = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    // This policy statement allows to invoke the other lambda via API GW
    const policyStatement = new iam.PolicyStatement({
      resources: [getApiGwArn()],
      effect: iam.Effect.ALLOW,
      actions: ["execute-api:Invoke"],
    });

    fun.addToRolePolicy(policyStatement);

    // Save these outputs
    new cdk.CfnOutput(this, "roleArn", { value: fun.role!.roleArn });
    new cdk.CfnOutput(this, "url", { value: gw.url });
  }
}
