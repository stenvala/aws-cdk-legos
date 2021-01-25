import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import { S3EventSource } from "@aws-cdk/aws-lambda-event-sources";
import * as s3 from "@aws-cdk/aws-s3";
import * as cdk from "@aws-cdk/core";

const BUCKET_NAME = "lambda-and-s3-to-dynamo-test-s3";
const TABLE_NAME = "lambda-and-s3-to-dynamo-test-db";
const TABLE_KEY = "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = this.dynamo();
    const lambda = this.restLambda();
    const moverLambda = this.moverLambda();

    const bucket = this.s3();
    bucket.grantReadWrite(lambda);
    bucket.grantReadWrite(moverLambda);

    const ps = new iam.PolicyStatement();
    ps.addActions("dynamodb:*");
    ps.addResources(`${table.tableArn}/index/*`, table.tableArn);

    lambda.addToRolePolicy(ps);
    moverLambda.addToRolePolicy(ps);

    // Add moverLambda permissions correctly and add event source
    moverLambda.addPermission("AllowS3Invocation", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("s3.amazonaws.com"),
      sourceArn: bucket.bucketArn,
    });

    const s3EventSource = new S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: "trigger/" }], // optional
    });

    moverLambda.addEventSource(s3EventSource);
  }

  private getLambdaEnvVars() {
    return {
      BUCKET_NAME,
      TABLE_NAME,
      PRIMARY_KEY: TABLE_KEY,
    };
  }

  private moverLambda() {
    return new lambda.Function(this, "MoverLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.stepFunction",
      environment: this.getLambdaEnvVars(),
    });
  }

  private restLambda() {
    const fun = new lambda.Function(this, "RestLambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: this.getLambdaEnvVars(),
    });

    const api = new apigw.LambdaRestApi(this, "ApiGW", {
      handler: fun,
    });

    new cdk.CfnOutput(this, "url", { value: api.url });

    return fun;
  }

  private s3() {
    return new s3.Bucket(this, "Bucket", {
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
