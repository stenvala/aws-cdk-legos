import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Ecr } from "./ecr";
import { Lambda } from "./lambda";
import { Network } from "./network";
import { Props } from "./props";
import { Task } from "./task";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackProps: Props = {
      constructs: {},
    };

    const network = new Network(this, stackProps);
    stackProps.constructs.vpc = network.vpc;

    /*
    const ecr = new Ecr(this, stackProps);
    stackProps.constructs.repository = ecr.repository;
    */

    const task = new Task(this, stackProps);
    stackProps.constructs.cluster = task.cluster;
    stackProps.constructs.task = task.task;
    stackProps.constructs.taskRole = task.role;

    new Lambda(this, stackProps);
  }
}
