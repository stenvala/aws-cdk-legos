import {
  App,
  aws_lambda as lambda,
  aws_logs as log,
  aws_stepfunctions as sfn,
  aws_stepfunctions_tasks as tasks,
  Duration,
  Stack,
  StackProps,
} from "aws-cdk-lib";

const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../src/";

export class CdkStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const init = this.createStepLambda("Initialization", "initial");
    const main = this.createStepLambda("Main", "main");
    const final = this.createStepLambda("Final", "final");

    const initStep = new tasks.LambdaInvoke(this, "Init job", {
      lambdaFunction: init,
      outputPath: "$.Payload", // This must be $.Payload to get the lambda's return object as output
    });

    const waitX = new sfn.Wait(this, "Wait x seconds", {
      time: sfn.WaitTime.secondsPath("$.waitSeconds"),
    });

    const mainStep = new tasks.LambdaInvoke(this, "Try to do the job", {
      lambdaFunction: main,
      inputPath: "$.result", // From init step result is converted to event (note, lambda may return something else too, e.g. waitSeconds)
      outputPath: "$.Payload",
    });

    const failed = new sfn.Fail(this, "Failed", {
      cause: "Batch Job Failed",
      error: "Job Failed",
    });

    const finalStep = new tasks.LambdaInvoke(this, "Get final status", {
      lambdaFunction: final,
      inputPath: "$.result",
      outputPath: "$.Payload",
    });

    const definition = initStep
      .next(waitX)
      .next(mainStep)
      .next(
        new sfn.Choice(this, "Is done?")
          // Look at the "status" field
          .when(sfn.Condition.stringEquals("$.status", "FAILED"), failed)
          .when(sfn.Condition.stringEquals("$.status", "SUCCEEDED"), finalStep)
          .otherwise(waitX) // Get's back to previous setp
      );

    new sfn.StateMachine(this, "StateMachine", {
      definition,
      timeout: Duration.minutes(2),
    });
  }

  private createStepLambda(name: string, handler: string) {
    const fun = new lambda.Function(this, name, {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION + handler),
      handler: handler + ".handler",
      timeout: Duration.minutes(2),
      logRetention: log.RetentionDays.ONE_DAY,
    });
    return fun;
  }
}
