import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class TsHelloWorldStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fun = new lambda.Function(this, "IamLambdaHandler2", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../src"),
      handler: "app.lambdaHandler2",
    });
    /*
    // THIS IS NOW WITHOUT AUTHENTICATION
    
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
      options: {},
    });

    new apigw.CfnAuthorizer(this, "IAMAuthorizer", {
      restApiId: apiGW.restApiId,
      type: apigw.AuthorizationType.IAM,
    });

    const lambda1RoleArn =
      "arn:aws:iam::725670626446:role/Lambda2LambdaPart1-IamLambdaHandler1ServiceRoleCF6-165RFCX6APINI";

    const iamUser = new iam.ArnPrincipal(lambda1RoleArn);

    const policyStatement = new iam.PolicyStatement({
      resources: [apiGW.restApiRootResourceId],
      actions: ["lambda:InvokeFunction"],
    });

    iamUser.addToPolicy(policyStatement);
  }
}
