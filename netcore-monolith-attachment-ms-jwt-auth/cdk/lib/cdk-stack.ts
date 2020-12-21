import * as cdk from "@aws-cdk/core";
import { AmisStack } from "./amis-stack";
import { AuthStack } from "./auth-stack";
import { AuthParam } from "./key";
import { MonoStack } from "./mono-stack";

const PREFIX = "NetcoreSystem-";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const autKey = new AuthParam(this, PREFIX);

    const monoStack = new MonoStack(this, PREFIX);
    const amisStack = new AmisStack(this, PREFIX);
    const authStack = new AuthStack(this, PREFIX);
  }
}
