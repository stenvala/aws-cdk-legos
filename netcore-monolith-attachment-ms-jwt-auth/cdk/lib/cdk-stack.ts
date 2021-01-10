import * as cdk from "@aws-cdk/core";
import { Amis } from "./amis";
import { Auth } from "./auth";
import { GlobalProps } from "./models";
import { Mono } from "./mono";
import { UI } from "./ui";

const PREFIX = "NetcoreSys-";

export class CdkStack extends cdk.Stack {
  authStack: Auth;
  monoStack: Mono;
  amisStack: Amis;

  constructor(
    scope: cdk.App,
    id: string,
    globalProps: GlobalProps,
    props?: cdk.StackProps
  ) {
    super(scope, PREFIX + id, props);

    //const authKey = new AuthParam(this, PREFIX);

    this.authStack = new Auth(this, PREFIX, globalProps);

    this.monoStack = new Mono(this, PREFIX, this.authStack, globalProps);

    this.amisStack = new Amis(this, PREFIX, this.authStack, globalProps);

    new UI(this, PREFIX);
  }
}
