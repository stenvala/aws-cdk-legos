import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as CdkStack from "../lib/cdk-stack";

test("Lambda Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkStack.Lambda2Stack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});

test("ApiGateway Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkStack.Lambda2Stack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});
