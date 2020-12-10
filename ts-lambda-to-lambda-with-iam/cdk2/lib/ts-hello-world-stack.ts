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
      options: {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.IAM,
        },
      },
    });

    // This is the role of the other lambda
    const lambda1RoleArn =
      // "arn:aws:iam::725670626446:role/Lambda2LambdaPart1-IamLambdaHandler1ServiceRoleCF6-165RFCX6APINI";
      "arn:aws:iam::364632538942:role/Lambda2LambdaPart1-IamLambdaHandler1ServiceRoleCF6-1L7CSNQA30AND";

    const iamUser = iam.Role.fromRoleArn(this, "Role", lambda1RoleArn);

    const policyStatement = new iam.PolicyStatement({
      resources: [apiGW.restApiRootResourceId],
      effect: iam.Effect.ALLOW,
      actions: ["execute-api:Invoke", "lambda:InvokeFunction"],
    });

    fun.grantInvoke(iamUser);

    // iamUser.addToPrincipalPolicy(policyStatement);

    // iamUser.attachInlinePolicy(policy);
  }
}
