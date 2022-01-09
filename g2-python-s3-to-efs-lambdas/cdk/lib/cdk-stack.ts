import {
  App,
  aws_apigateway as apigw,
  aws_ec2 as ec2,
  aws_efs as efs,
  aws_lambda as lambda,
  aws_lambda_event_sources as eventSources,
  aws_logs as log,
  aws_s3 as s3,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";

const BUCKET_NAME = "python-lambdas-s3-to-efs";
const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../src";
const ASSETS = lambda.Code.fromAsset(ASSET_LOCATION);
const MNT_EFS_TO = "/mnt/efs";

export class CdkStack extends Stack {
  private vpc: ec2.Vpc;

  constructor(scope: App, id: string, props?: StackProps) {
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
      timeout: Duration.minutes(15),
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        efsAccessPoint,
        MNT_EFS_TO
      ),
      vpc: this.vpc,
    });
    return fun;
  }

  private httpLambda(efsAccessPoint: efs.AccessPoint) {
    const fun = new lambda.Function(this, "HttpLambda", {
      runtime: RUNTIME,
      code: ASSETS,
      logRetention: log.RetentionDays.ONE_DAY,
      handler: "http_lambda.handler",
      timeout: Duration.seconds(30),
      environment: {
        EFS: MNT_EFS_TO,
      },
      filesystem: lambda.FileSystem.fromEfsAccessPoint(
        efsAccessPoint,
        MNT_EFS_TO
      ),
      vpc: this.vpc,
    });
    const api = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
      binaryMediaTypes: ["*/*"],
    });
    new CfnOutput(this, "url", { value: api.url });
    return fun;
  }

  private s3(lambda: lambda.Function) {
    const bucket = new s3.Bucket(this, "Bucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(lambda);

    const s3EventSource = new eventSources.S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
    });
    lambda.addEventSource(s3EventSource);
  }

  private efs() {
    // This is not the way how you want to deploy a VPC for real production use.
    // Typically you deploy VPC in different stack with subnets, nat, etc but here we
    // just need VPC where the EFS locates
    this.vpc = new ec2.Vpc(this, "VPC");
    const fileSystem = new efs.FileSystem(this, "EFS", {
      vpc: this.vpc,
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
