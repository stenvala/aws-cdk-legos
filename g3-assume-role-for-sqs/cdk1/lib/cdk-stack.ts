import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Use this to have explicit name for the role of lambda, then the ARN will also be nicer
    const roleOfLambda = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "G3AssumeRoleForSQSLambdaRole",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
    });

    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist1"),
      handler: "app.lambdaHandler",
      role: roleOfLambda,
    });

    const gw = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    // Add to lambda's role policy that allows assuming roles
    const policyStatement = new iam.PolicyStatement({
      resources: ["*"], // Use "*" here, we can't know what role we would like to use, now we can assume any role (that is allowed for the role of this lambda to be assumed)
      effect: iam.Effect.ALLOW,
      actions: ["sts:AssumeRole"],
    });

    // Following two are equivalent, but this looks a bit better

    // With custom role:
    roleOfLambda.addToPolicy(policyStatement);

    // If not custom role:
    // fun.addToRolePolicy(policyStatement);

    // Save these outputs, needed later
    new cdk.CfnOutput(this, "url", { value: gw.url });
    new cdk.CfnOutput(this, "lambdaRoleArn", { value: roleOfLambda.roleArn }); //fun.role!.roleArn });
  }
}
