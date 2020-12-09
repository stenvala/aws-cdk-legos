import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const BUCKET_NAME = "lambda-and-s3-to-dynamo-test-s3";
const TABLE_NAME = "lambda-and-s3-to-dynamo-test-db";
const TABLE_KEY = "path";

export class CdkStack extends cdk.Stack {
  private tableName: string;
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = this.dynamo();
    this.tableName = table.tableName;
    const lambda = this.lambda();

    const bucket = this.s3();
    bucket.grantReadWrite(lambda);
    const ps = new iam.PolicyStatement();
    ps.addActions("dynamodb:*");
    ps.addResources(`${table.tableArn}/index/*`, table.tableArn);
    lambda.addToRolePolicy(ps);
  }

  private stepLambda() {
    return new lambda.Function(this, "StepHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.stepFunction",
      environment: {
        BUCKET_NAME,
        TABLE_NAME: this.tableName,
        PRIMARY_KEY: TABLE_KEY,
      },
    });
  }

  private lambda() {
    const hello = new lambda.Function(this, "RestApiHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: {
        // Add environment variables like this, so then we can use this in app
        BUCKET_NAME,
        TABLE_NAME: this.tableName,
        PRIMARY_KEY: TABLE_KEY,
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
      partitionKey: {
        name: TABLE_KEY,
        type: dynamodb.AttributeType.STRING,
      },
      tableName: TABLE_NAME,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
