import {
  App,
  aws_apigateway as apigw,
  aws_lambda as lambda,
  aws_logs as log,
  aws_s3 as s3,
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";

const BUCKET_NAME = "g1-ts-lambda-and-s3-bucket";

export class CdkStack extends Stack {
  private get bucketName() {
    return BUCKET_NAME;
  }

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFun = this.lambda();
    this.s3(lambdaFun);
  }

  private lambda() {
    const fun = new lambda.Function(this, "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: {
        BUCKET_NAME: this.bucketName,
      },
      logRetention: log.RetentionDays.ONE_DAY,
    });

    const api = new apigw.LambdaRestApi(this, "ApiGw", {
      handler: fun,
    });

    new CfnOutput(this, "url", { value: api.url });

    return fun;
  }

  private s3(lambda: lambda.Function) {
    const bucket = new s3.Bucket(this, "Bucket", {
      versioned: false,
      bucketName: this.bucketName,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(lambda);
  }
}
