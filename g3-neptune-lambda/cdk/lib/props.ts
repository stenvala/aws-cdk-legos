import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as neptune from "@aws-cdk/aws-neptune-alpha";

export interface Props {
  constructs: {
    vpc?: ec2.IVpc;
    privateSubnets?: ec2.ISubnet[];
    isolatedSubnets?: ec2.ISubnet[];
    securityGroupApi?: ec2.ISecurityGroup;
    dbCluters?: neptune.IDatabaseCluster;
  };
}
