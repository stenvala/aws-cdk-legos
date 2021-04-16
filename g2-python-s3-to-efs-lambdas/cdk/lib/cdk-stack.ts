import * as apigw from "@aws-cdk/aws-apigateway";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as efs from "@aws-cdk/aws-efs";
import * as lambda from "@aws-cdk/aws-lambda";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as log from "@aws-cdk/aws-logs";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const BUCKET_NAME = "python-lambdas-s3-to-efs";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../src";
const ASSETS = lambda.Code.fromAsset(ASSET_LOCATION);
const MNT_EFS_TO = "/mnt/efs";

export class CdkStack extends cdk.Stack {
  private vpc: ec2.Vpc;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const efsAccessPoint = this.efs();

    this.httpLambda(efsAccessPoint);
    const moverLambda = this.moverLambda(efsAccessPoint);
    this.s3(moverLambda);
  }

  private moverLambda(efsAccessPoint: efs.AccessPoint) {
    const fun = new lambda.Function(this, "MoverLambda", {
      runtime: RUNTIME,
      code: ASSETS,
      handler: "mover_lambda.handler",
      environment: {
        BUCKET_NAME,
        EFS: MNT_EFS_TO,
      },
      logRetention: log.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.minutes(15),
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        efsAccessPoint as any,
        MNT_EFS_TO
      ),
      vpc: this.vpc as any,
    });
    return fun;
  }

  private httpLambda(efsAccessPoint: efs.AccessPoint) {
    const fun = new lambda.Function(this, "HttpLambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION, {
        bundling: {
          image: lambda.Runtime.PYTHON_3_8.bundlingDockerImage,
          command: [
            "bash",
            "-c",
            `
            pip install  -r requirements.txt -t /asset-output &&
            cp -au . /asset-output
            `,
          ],
        },
      }),
      logRetention: log.RetentionDays.ONE_DAY,
      handler: "http_lambda.handler",
      timeout: cdk.Duration.seconds(30),
      environment: {
        EFS: MNT_EFS_TO,
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        efsAccessPoint as any,
        MNT_EFS_TO
      ),
      vpc: this.vpc as any,
    });
    const api = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      binaryMediaTypes: ["*/*"],
    });
    new cdk.CfnOutput(this, "url", { value: api.url });
    return fun;
  }

  private s3(lambda: lambda.Function) {
    const bucket = new s3.Bucket(this, "Bucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(lambda);

    const s3EventSource = new S3EventSource((bucket as unknown) as any, {
      events: [s3.EventType.OBJECT_CREATED],
    });
    lambda.addEventSource((s3EventSource as unknown) as any);
  }

  private efs() {
    this.vpc = new ec2.Vpc(this, "VPC");
    const fileSystem = new efs.FileSystem(this, "EFS", {
      vpc: this.vpc as any,
      encrypted: false,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
    });

    // create a new access point from the filesystem
    const accessPoint = fileSystem.addAccessPoint("AccessPoint", {
      path: "/export/lambda",

      // as given path does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
      createAcl: {
        ownerUid: "1001",
        ownerGid: "1001",
        permissions: "750",
      },
      // enforce the POSIX identity so lambda function will access with this identity
      posixUser: {
        uid: "1001",
        gid: "1001",
      },
    });
    return accessPoint;
  }
}
