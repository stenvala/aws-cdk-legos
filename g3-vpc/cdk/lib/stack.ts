import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Props } from "./props";
import { SecurityGroups } from "./security-groups";
import { Vpc } from "./vpc";

export class Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackProps: Props = {
      constructs: {},
    };
    stackProps.constructs.vpc = new Vpc(this, stackProps).vpc;
    new SecurityGroups(this, stackProps);
  }
}
