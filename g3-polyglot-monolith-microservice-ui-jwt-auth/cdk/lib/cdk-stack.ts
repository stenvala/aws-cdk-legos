import * as cdk from "@aws-cdk/core";
import { Amis } from "./amis";
import { Auth } from "./auth";
import { CustomDomainNameFactory } from "./custom-domain-name.factory";
import { DemoAuth } from "./demo-auth";
import { GlobalProps } from "./models";
import { Mono } from "./mono";
import { UI } from "./ui";

const STACK_NAME = "G3-AmisMicroservice";

export class CdkStack extends cdk.Stack {
  authStack: Auth;
  demoAuthStack: DemoAuth;
  monoStack: Mono;
  amisStack: Amis;

  constructor(
    scope: cdk.App,
    globalProps: GlobalProps,
    props?: cdk.StackProps
  ) {
    super(scope, STACK_NAME, props);

    if (globalProps.useCustomDomainName) {
      console.log("Using custom domain names");
      globalProps.customDomainNameFactory = new CustomDomainNameFactory(this);
    }

    //const authKey = new AuthParam(this, PREFIX);

    this.authStack = new Auth(this, globalProps);

    if (globalProps.amisAuth == "demo") {
      this.demoAuthStack = new DemoAuth(this, this.authStack, globalProps);
      globalProps.amisAuth = "api";
    }

    this.amisStack = new Amis(this, this.authStack, globalProps);

    this.monoStack = new Mono(
      this,
      this.authStack,
      this.amisStack.eventBus,
      globalProps
    );

    new UI(this, globalProps);

    if (globalProps.useCustomDomainName) {
      console.log("Creating subdomains");
      globalProps.customDomainNameFactory!.createForSubdomain(
        "auth",
        this.authStack.apigw
      );
      globalProps.customDomainNameFactory!.createForSubdomain(
        "amis",
        this.amisStack.apigw
      );
      globalProps.customDomainNameFactory!.createForSubdomain(
        "mono",
        this.monoStack.apigw
      );
      if (this.demoAuthStack) {
        globalProps.customDomainNameFactory!.createForSubdomain(
          "demoauth",
          this.demoAuthStack.apigw
        );
      }
    }
  }
}
