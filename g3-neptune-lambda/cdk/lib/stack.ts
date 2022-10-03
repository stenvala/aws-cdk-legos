import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Props } from "./props";
import { Network } from "./network";
import { Lambda } from "./lambda";
import { DB } from "./db";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackProps: Props = {
      constructs: {},
    };

    const network = new Network(this, stackProps);
    stackProps.constructs.vpc = network.vpc;
    stackProps.constructs.privateSubnets = network.privateSubnets;
    stackProps.constructs.isolatedSubnets = network.isolatedSubnets;
    stackProps.constructs.securityGroupApi = network.securityGroupApi;

    const db = new DB(this, stackProps);
    stackProps.constructs.dbCluters = db.cluster;

    new Lambda(this, stackProps);
  }
}
