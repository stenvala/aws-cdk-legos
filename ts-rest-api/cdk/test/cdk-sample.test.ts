import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as CdkSample from "../lib/cdk-stack";

test("SQS Queue Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkSample.CdkStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});

test("SNS Topic Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkSample.CdkStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});
