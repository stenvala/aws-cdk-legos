import * as lambda from "@aws-cdk/aws-lambda";
import * as log from "@aws-cdk/aws-logs";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as cdk from "@aws-cdk/core";

const PREFIX = "PythonStepFunctions";

const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../src";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, props?: cdk.StackProps) {
    super(scope, PREFIX, props);

    const lambda1 = this.createStepLambda("Step1", "step1.handler");
    const lambda2 = this.createStepLambda("Step1", "step2.handler");

    const job1 = new tasks.LambdaInvoke(this, "Submit Job", {
      lambdaFunction: lambda1,
      // Lambda's result is in the attribute `Payload`
      outputPath: "$.Payload",
    });

    const waitX = new sfn.Wait(this, "Wait X Seconds", {
      time: sfn.WaitTime.secondsPath("$.waitSeconds"),
    });

    const getStatus = new tasks.LambdaInvoke(this, "Get Job Status", {
      lambdaFunction: lambda2,
      // Pass just the field named "guid" into the Lambda, put the
      // Lambda's result in a field called "status" in the response
      inputPath: "$.guid",
      outputPath: "$.Payload",
    });

    const jobFailed = new sfn.Fail(this, "Job Failed", {
      cause: "AWS Batch Job Failed",
      error: "DescribeJob returned FAILED",
    });

    const finalStatus = new tasks.LambdaInvoke(this, "Get Final Job Status", {
      lambdaFunction: lambda2,
      // Use "guid" field as input
      inputPath: "$.guid",
      outputPath: "$.Payload",
    });

    const definition = job1
      .next(waitX)
      .next(getStatus)
      .next(
        new sfn.Choice(this, "Job Complete?")
          // Look at the "status" field
          .when(sfn.Condition.stringEquals("$.status", "FAILED"), jobFailed)
          .when(
            sfn.Condition.stringEquals("$.status", "SUCCEEDED"),
            finalStatus
          )
          .otherwise(waitX)
      );

    new sfn.StateMachine(this, "StateMachine", {
      definition,
      timeout: cdk.Duration.minutes(5) as any,
    });
  }

  private createStepLambda(name: string, handler: string) {
    const fun = new lambda.Function(this, name, {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: handler,
      timeout: cdk.Duration.minutes(15) as any,
      logRetention: log.RetentionDays.ONE_DAY,
    });
    return fun;
  }
}
