import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { PARAMETER_STORE_KEYS } from "./const";
import { Props } from "./props";

export class Network {
  vpc: ec2.IVpc;
  publicSubnets: ec2.ISubnet[];
  privateSubnets: ec2.ISubnet[];
  isolatedSubnets: ec2.ISubnet[];
  securityGroupApi: ec2.ISecurityGroup;

  constructor(stack: cdk.Stack, props: Props) {
    const vpcId = ssm.StringParameter.valueFromLookup(
      stack,
      PARAMETER_STORE_KEYS.VPC.ID
    );

    this.vpc = ec2.Vpc.fromLookup(stack, "VPC", {
      vpcId,
    });

    this.publicSubnets = [
      ec2.Subnet.fromSubnetId(
        stack,
        "Public1",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.PUBLIC_1.ID
        )
      ),
      ec2.Subnet.fromSubnetId(
        stack,
        "Public2",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.PUBLIC_2.ID
        )
      ),
    ];

    this.privateSubnets = [
      ec2.Subnet.fromSubnetId(
        stack,
        "Private1",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.PRIVATE_1.ID
        )
      ),
      ec2.Subnet.fromSubnetId(
        stack,
        "Private2",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.PRIVATE_2.ID
        )
      ),
    ];

    this.isolatedSubnets = [
      ec2.Subnet.fromSubnetId(
        stack,
        "Isolated1",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.ISOLATED_1.ID
        )
      ),
      ec2.Subnet.fromSubnetId(
        stack,
        "Isolated2",
        ssm.StringParameter.valueFromLookup(
          stack,
          PARAMETER_STORE_KEYS.VPC.SUBNETS.ISOLATED_2.ID
        )
      ),
    ];

    this.securityGroupApi = ec2.SecurityGroup.fromSecurityGroupId(
      stack,
      "ApiSG",
      ssm.StringParameter.valueFromLookup(
        stack,
        PARAMETER_STORE_KEYS.SECURITY_GROUP.WEBSERVER.ID
      )
    );
  }
}
