import * as apigw from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const BUCKET_NAME = "lambda-and-s3-test";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFun = this.lambda();
    this.s3(lambdaFun);
  }

  private lambda() {
    const hello = new lambda.Function(this, "Ms2DemoHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: {
        // Add environment variables like this, so then we can use this in app
        BUCKET_NAME,
      },
    });

    // Wire lambda to api gateway
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
    return hello;
  }

  private s3(lambda: lambda.Function) {
    const bucket = new s3.Bucket(this, "sampleBucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    bucket.grantReadWrite(lambda);
  }
}
