import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";

export interface Props {
  constructs: {
    vpc?: ec2.Vpc;
    repository?: ecr.IRepository;
    cluster?: ecs.Cluster;
    task?: ecs.FargateTaskDefinition;
    taskRole?: iam.Role;
  };
}
