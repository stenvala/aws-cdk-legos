import * as ecr from "@aws-cdk/aws-ecr";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

function getRepositoryName() {
  const data = JSON.parse(fs.readFileSync("../props.json", "utf8"));
  return data["repositoryName"];
}

export class CdkEcrStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new EcrRepository(this);
  }
}

export class EcrRepository {
  repository: ecr.IRepository;
  constructor(stack: cdk.Stack) {
    this.repository = new ecr.Repository(stack, "ECRepository", {
      repositoryName: getRepositoryName(),
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
