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
const AWS_ID_PREFIX = "StepDemo-";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, AWS_ID_PREFIX + id, props);      

    const table = this.dynamo();
    const lambda = this.restLambda();
    const stepLambda = this.stepLambda();

    const bucket = this.s3();
    bucket.grantReadWrite(lambda);
    bucket.grantReadWrite(stepLambda);

    const ps = new iam.PolicyStatement();
    ps.addActions("dynamodb:*");
    ps.addResources(`${table.tableArn}/index/*`, table.tableArn);
    
    lambda.addToRolePolicy(ps);
    stepLambda.addToRolePolicy(ps);

    // Add stepLambda permissions correctly and add event source
    stepLambda.addPermission(AWS_ID_PREFIX + "AllowS3Invocation", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("s3.amazonaws.com"),
      sourceArn: bucket.bucketArn,
    });

    // requires unknown any cast, don't understand why
    const s3EventSource = new S3EventSource((bucket as unknown) as any, {
      events: [s3.EventType.OBJECT_CREATED],      
      filters: [{ prefix: "trigger/" }], // optional
    });

    // requires unknown any cast, don't understand why
    stepLambda.addEventSource((s3EventSource as unknown) as any);

  }

  private getLambdaEnvVars() {
    return {
      BUCKET_NAME,
      TABLE_NAME,
      PRIMARY_KEY: TABLE_KEY,
    };
  }

  private stepLambda() {
    return new lambda.Function(this, AWS_ID_PREFIX + "StepHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.stepFunction",
      environment: this.getLambdaEnvVars(),
    });
  }

  private restLambda() {
    const handler = new lambda.Function(this, AWS_ID_PREFIX + "RestApiHandler", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.httpHandler",
      environment: this.getLambdaEnvVars(),
    });

    // Wire lambda to api gateway
    const api = new apigw.LambdaRestApi(this, AWS_ID_PREFIX + "ApiGW", {
      handler,
    });

    new cdk.CfnOutput(this, "url", { value: api.url });

    return handler;
  }

  private s3() {
    return new s3.Bucket(this, AWS_ID_PREFIX + "S3Bucket", {
      versioned: false,
      bucketName: BUCKET_NAME,
      encryption: s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private dynamo() {
    return new dynamodb.Table(this, AWS_ID_PREFIX + "DynamoTable", {
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
