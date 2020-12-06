import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as TsHelloWorld from "../lib/ts-hello-world-stack";

test("Lambda Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TsHelloWorld.TsHelloWorldStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::Lambda::Function"));
});

test("ApiGateway Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TsHelloWorld.TsHelloWorldStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(haveResource("AWS::ApiGateway::RestApi"));
});
