import * as apigw from "@aws-cdk/aws-apigateway";
import * as ecr from "@aws-cdk/aws-ecr";
import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as cdk from "@aws-cdk/core";
import * as fs from "fs";

function getTag() {
  const version = fs.readFileSync("../build/latest_version.txt", "utf8");
  console.log("Solved latest version: ", version);
  return version;
}

function getRepositoryName() {
  const data = JSON.parse(fs.readFileSync("../props.json", "utf8"));
  return data["repositoryName"];
}

export class CdkLambdaStack extends cdk.Stack {
  private repository: ecr.IRepository;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = ecr.Repository.fromRepositoryName(
      this,
      "ECR",
      getRepositoryName()
    );

    // Use existing ECR image
    // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-lambda.EcrImageCode.html
    const ecrImage = new lambda.EcrImageCode(this.repository, {
      tag: getTag(),
    });

    const fun = new lambda.Function(this, "Lambda", {
      code: ecrImage,
      handler: lambda.Handler.FROM_IMAGE,
      runtime: lambda.Runtime.FROM_IMAGE,
      memorySize: 1024,
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(30),
    });

    const api = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    new cdk.CfnOutput(this, "url", { value: api.url });
  }
}
