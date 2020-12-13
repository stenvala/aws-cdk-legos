import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

function getRoleArn() {
  const data = fs.readFileSync("../cdk1/output.json", "utf8");
  return JSON.parse(data)["Lambda2LambdaPart1"]["RoleArn"];
}

export class Lambda2Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fun = new lambda.Function(this, "IamLambdaHandler2", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "app.lambdaHandler2",
    });

    /*
    // This would be fine without authentication
    
    const gw = new apigw.LambdaRestApi(this, "Endpoint2", {
      handler: fun,
      proxy: true,
    });

    return;
    */
    // This is with iam role based authentication

    const apiGW = new apigw.LambdaRestApi(this, "Endpoint2", {
      handler: fun,
      proxy: true,
      options: {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.IAM,
        },
      },
    });

    // This is the role of the other lambda
    const iamRole = iam.Role.fromRoleArn(this, "Role", getRoleArn());

    // This policy statement allows to invoice lambda via API GW with the other role
    const policyStatement = new iam.PolicyStatement({
      resources: [apiGW.arnForExecuteApi()],
      effect: iam.Effect.ALLOW,
      actions: ["execute-api:Invoke"],
    });

    const policy = new iam.Policy(this, "DemoPolicyLambda2Lambda", {
      statements: [policyStatement],
    });

    iamRole.attachInlinePolicy(policy);

    new cdk.CfnOutput(this, "PrivateUrl", { value: apiGW.url });
  }
}
