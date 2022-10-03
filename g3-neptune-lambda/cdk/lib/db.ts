import * as cdk from "aws-cdk-lib";
import * as neptune from "@aws-cdk/aws-neptune-alpha";
import { Props } from "./props";

export class DB {
  cluster: neptune.IDatabaseCluster;

  constructor(stack: cdk.Stack, props: Props) {
    const subnets = props.constructs.isolatedSubnets!;
    this.cluster = new neptune.DatabaseCluster(stack, "Database", {
      vpc: props.constructs.vpc!,
      instanceType: neptune.InstanceType.R5_LARGE,
      instances: 1,
      iamAuthentication: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoMinorVersionUpgrade: true,
      storageEncrypted: false,
      vpcSubnets: {
        subnets,
      },
    });
  }
}
