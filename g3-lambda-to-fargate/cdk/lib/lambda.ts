import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Props } from "./props";

const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../src/lambda";
const HANDLER = "main.handler";
const ASSETS = lambda.Code.fromAsset(ASSET_LOCATION);

export class Lambda {
  constructor(stack: cdk.Stack, props: Props) {
    const fun = new lambda.Function(stack, "Lambda", {
      runtime: RUNTIME,
      code: ASSETS,
      handler: HANDLER,
      environment: {
        CLUSTER_NAME: props.constructs.cluster!.clusterName,
        TASK_DEFINITION_ARN: props.constructs.task!.taskDefinitionArn,
        SUBNETS: "subnet-07fd0695cc4076c37,subnet-0d4c471c9d50479cd", //props.constructs
        //.vpc!.privateSubnets.map((i) => i.subnetId)
        //.join(","),
        TASK_EXECUTION_ROLE_ARN: props.constructs.taskRole!.roleArn,
        SECURITY_GROUP: props.constructs.vpc?.vpcDefaultSecurityGroup!,
      },
      logRetention: logs.RetentionDays.ONE_DAY,
    });

    props.constructs.task!.grantRun(fun);
    fun.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:Passrole"],
        resources: ["*"],
        /*
        https://dev.to/ryands17/generating-video-thumbnails-with-s3-and-fargate-using-the-cdk-35il
        taskDefinition.taskRole.roleArn,
        taskDefinition.executionRole?.roleArn || '',
      */
      })
    );

    const api = new apigw.LambdaRestApi(stack, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    new cdk.CfnOutput(stack, "Url", { value: api.url });
  }
}
