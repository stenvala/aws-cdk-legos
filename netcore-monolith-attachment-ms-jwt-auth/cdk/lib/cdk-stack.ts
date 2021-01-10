import * as cdk from "@aws-cdk/core";
import { AmisStack } from "./amis-stack";
import { AuthStack } from "./auth-stack";
import { GlobalProps } from "./models";
import { MonoStack } from "./mono-stack";
import { UIStack } from "./ui-stack";

const PREFIX = "NetcoreSys-";

export class CdkStack extends cdk.Stack {
  authStack: AuthStack;
  monoStack: MonoStack;
  amisStack: AmisStack;

  constructor(
    scope: cdk.App,
    id: string,
    globalProps: GlobalProps,
    props?: cdk.StackProps
  ) {
    super(scope, PREFIX + id, props);

    //const authKey = new AuthParam(this, PREFIX);

    this.authStack = new AuthStack(this, PREFIX, globalProps);

    this.monoStack = new MonoStack(this, PREFIX, this.authStack, globalProps);

    this.amisStack = new AmisStack(this, PREFIX, this.authStack, globalProps);

    new UIStack(this, PREFIX);
  }
}
