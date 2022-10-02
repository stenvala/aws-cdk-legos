import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import { Props } from "./props";

const TASK_SRC = "../src/fargate";

export class Task {
  role: iam.Role;
  cluster: ecs.Cluster;
  task: ecs.FargateTaskDefinition;
  private logGroup: logs.LogGroup;
  constructor(private stack: cdk.Stack, props: Props) {
    // Perhaps you can use also implicit role: https://dev.to/ryands17/generating-video-thumbnails-with-s3-and-fargate-using-the-cdk-35il
    // Cluster
    this.cluster = new ecs.Cluster(stack, "Cluster", {
      vpc: props.constructs.vpc,
    });
    // Create role
    this.logGroup = new logs.LogGroup(stack, "LogGroup", {
      logGroupName: `${stack.stackName}TaskLogGroup`,
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    this.role = this.createRole();

    // define your task
    this.task = new ecs.FargateTaskDefinition(stack, "TaskDefinition", {
      cpu: 256,
      memoryLimitMiB: 512,
      taskRole: this.role,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    const image = new ecrAssets.DockerImageAsset(stack, "TaskImage", {
      directory: TASK_SRC,
    });

    this.task.addContainer("TaskContainer", {
      // Better to use in real CI/CD pipeline so that you can separate build and deploy
      // ecs.ContainerImage.fromEcrRepository(repository, "task")
      image: ecs.ContainerImage.fromDockerImageAsset(image),
      command: ["python", "/tmp/task.py"],
      logging: new ecs.AwsLogDriver({
        streamPrefix: "Ping",
        logGroup: this.logGroup,
      }),
      environment: {
        EXISTING_ENV_VAR: "prebaked",
      },
    });
  }

  private createRole() {
    const role = new iam.Role(this.stack, "TaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AmazonECSTaskExecutionRolePolicy"
      )
    );
    this.logGroup.grantWrite(role);
    return role;
  }
}
