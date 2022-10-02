import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { PARAMETER_STORE_KEYS } from "./const";
import { Props } from "./props";
import { addToParameterStore } from "./utils";

export class Vpc {
  vpc: ec2.Vpc;
  constructor(stack: cdk.Stack, props: Props) {
    this.vpc = new ec2.Vpc(stack, "Vpc", {
      cidr: "10.0.0.0/16", // 16 -> 65536 addresses, all start with 10.0.
      natGateways: 1,
      maxAzs: 2, // Could be 3 as well, but this is now 2
      enableDnsHostnames: true,
      enableDnsSupport: true,
      gatewayEndpoints: {
        S3: {
          // By default allowed from all subnets
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
        DYNAMO_DB: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      },
      subnetConfiguration: [
        {
          // This is the place for public stuff
          cidrMask: 24, // 256 addresses
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          // This is the place for workers / backend loads
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Means it's possible to go out from VPC, but not in
          cidrMask: 24,
        },
        {
          // This is the place for databases
          name: "isolated-subnet",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // Means it's not possible to go out or in from/to VPC
          cidrMask: 28,
        },
      ],
    });
    //
    addToParameterStore(stack, {
      id: "VpcIdPS",
      parameterName: PARAMETER_STORE_KEYS.VPC.ID,
      stringValue: this.vpc.vpcId,
    });
    //
    addToParameterStore(stack, {
      id: "PublicSubnet1PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.PUBLIC_1.ID,
      stringValue: this.vpc.publicSubnets[0].subnetId,
    });

    addToParameterStore(stack, {
      id: "PublicSubnet2PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.PUBLIC_2.ID,
      stringValue: this.vpc.publicSubnets[1].subnetId,
    });
    //
    addToParameterStore(stack, {
      id: "PrivateSubnet1PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.PRIVATE_1.ID,
      stringValue: this.vpc.privateSubnets[0].subnetId,
    });

    addToParameterStore(stack, {
      id: "PrivateSubnet2PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.PRIVATE_2.ID,
      stringValue: this.vpc.privateSubnets[1].subnetId,
    });
    //
    addToParameterStore(stack, {
      id: "IsolatedSubnet1PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.ISOLATED_1.ID,
      stringValue: this.vpc.isolatedSubnets[0].subnetId,
    });

    addToParameterStore(stack, {
      id: "IsolatedSubnet2PS",
      parameterName: PARAMETER_STORE_KEYS.VPC.SUBNETS.ISOLATED_2.ID,
      stringValue: this.vpc.isolatedSubnets[1].subnetId,
    });
  }
}
