import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Props } from "./props";

export class Network {
  vpc: ec2.Vpc;
  constructor(stack: cdk.Stack, props: Props) {
    this.vpc = new ec2.Vpc(stack, "Vpc", {
      cidr: "10.0.0.0/21",
      natGateways: 0,
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 23,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });
  }
}
