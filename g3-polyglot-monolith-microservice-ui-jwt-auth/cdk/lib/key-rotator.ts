import * as apigw from "@aws-cdk/aws-apigateway";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import { KEY, KEY_PREFIX } from "./auth";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/key-rotator";
const HANDLER = "main.lambda_handler";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const PREFIX = "rotator-";
const ISSUER = "AMIS_AUTH";

export class KeyRotator {
  lambda: lambda.Function;
  authLambda: lambda.Function;
  apigw: apigw.LambdaRestApi;
  auth: apigw.TokenAuthorizer;

  constructor(private stack: cdk.Stack, props: GlobalProps) {
    this.lambda = new lambda.Function(stack, PREFIX + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      environment: {
        KEY: KEY,
        AWS: "true",
        ISSUER,
      },
      handler: HANDLER,
      memorySize: 128,
      reservedConcurrentExecutions: props.maxConcurrency,
      logRetention: log.RetentionDays.ONE_DAY,
    });
    this.allowToAccessParameterStore(this.lambda);

    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    // Run every day at 3AM UTC
    const rule = new events.Rule(stack, PREFIX + "Rule", {
      schedule: events.Schedule.expression("cron(0 3 ? * MON-FRI *)"),
    });

    rule.addTarget(new targets.LambdaFunction(this.lambda));

    this.apigw = new apigw.LambdaRestApi(stack, PREFIX + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }

  private allowToAccessParameterStore(fun: lambda.Function) {
    const region = this.stack.region;
    fun.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:PutParameter"],
        resources: [`arn:aws:ssm:${region}:*:parameter/${KEY_PREFIX}/*`],
      })
    );
  }
}
