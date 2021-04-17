import * as apigw from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist1"),
      handler: "app.lambdaHandler",
    });

    const gw = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    const policyStatement = new iam.PolicyStatement({
      resources: ["*"], // Use "*" here, we can't know what role we would like to use
      effect: iam.Effect.ALLOW,
      actions: ["sts:AssumeRole"],
    });

    fun.addToRolePolicy(policyStatement);

    // Save these outputs
    new cdk.CfnOutput(this, "url", { value: gw.url });
    new cdk.CfnOutput(this, "lambdaRoleArn", { value: fun.role!.roleArn });
  }
}
