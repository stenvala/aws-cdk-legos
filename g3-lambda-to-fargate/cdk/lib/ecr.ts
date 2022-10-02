import * as ecr from "aws-cdk-lib/aws-ecr";
import * as cdk from "aws-cdk-lib";
import { Props } from "./props";

export class Ecr {
  repository: ecr.IRepository;
  constructor(stack: cdk.Stack, props: Props) {
    this.repository = new ecr.Repository(stack, "ECRepository", {
      repositoryName: "fargate-example",
      imageScanOnPush: true,
      lifecycleRules: [
        {
          description: "Remove old versions",
          maxImageCount: 3,
          rulePriority: 1,
        },
      ],
    });
  }
}
