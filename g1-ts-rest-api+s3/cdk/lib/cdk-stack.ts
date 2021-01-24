import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const PREFIX = "TSLambdaAndS3-"
const BUCKET_NAME = "ts-lambda-and-s3-bucket";

export class CdkStack extends cdk.Stack {

  private get bucketName() {
    return BUCKET_NAME;
  }

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const lambdaFun = this.lambda();
    this.s3(lambdaFun);
  }

  private lambda() {
    const fun = new lambda.Function(this, PREFIX + "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: {
        BUCKET_NAME: this.bucketName
      },
    });
    
    const api = new apigw.LambdaRestApi(this, PREFIX + "ApiGw", {
      handler: fun,
    });

    new cdk.CfnOutput(this, "url", { value: api.url });

    return fun;
  }

  private s3(lambda: lambda.Function) {
    const bucket = new s3.Bucket(this, PREFIX + "Bucket", {
      versioned: false,
      bucketName: this.bucketName,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(lambda);
  }
}