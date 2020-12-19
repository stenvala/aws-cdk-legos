import * as cdk from "@aws-cdk/core";
import { AmisStack } from "./amis-stack";
import { MonoStack } from "./mono-stack";

const PREFIX = "NetcoreSystem-";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const monoStack = new MonoStack(this, PREFIX);
    const amisStack = new AmisStack(this, PREFIX);
  }
}
