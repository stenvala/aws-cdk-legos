import * as cdk from "@aws-cdk/core";
import { AuthStack } from "./auth-stack";
import { MonoStack } from "./mono-stack";
import { UIStack } from "./ui-stack";

const PREFIX = "NetcoreSystem-";

export class CdkStack extends cdk.Stack {
  authStack: AuthStack;
  monoStack: MonoStack;
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    //const authKey = new AuthParam(this, PREFIX);

    this.authStack = new AuthStack(this, PREFIX);

    this.monoStack = new MonoStack(this, PREFIX, this.authStack);

    new UIStack(this, PREFIX);
    // const amisStack = new AmisStack(this, PREFIX);
  }
}
