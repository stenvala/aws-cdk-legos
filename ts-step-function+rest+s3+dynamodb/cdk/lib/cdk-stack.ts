import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const BUCKET_NAME = "lambda-and-s3-to-dynamo-test-s3";
const TABLE_NAME = "lambda-and-s3-to-dynamo-test-db";

export class CdkStack extends cdk.Stack {
  private tableName: string;
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = this.dynamo();
    this.tableName = table.tableName;
    const lambda = this.lambda();

    const bucket = this.s3();
    bucket.grantReadWrite(lambda);
    table.grantReadWriteData(lambda);
  }

  private lambda() {
    const hello = new lambda.Function(this, "Ms2DemoHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: {
        // Add environment variables like this, so then we can use this in app
        BUCKET_NAME,
        TABLE: this.tableName,
      },
    });

    // Wire lambda to api gateway
    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: hello,
    });
    return hello;
  }

  private s3() {
    return new s3.Bucket(this, "sampleBucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private dynamo() {
    return new dynamodb.Table(this, "Table", {
      partitionKey: { name: "path", type: dynamodb.AttributeType.STRING },
      tableName: TABLE_NAME,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
  }
}
