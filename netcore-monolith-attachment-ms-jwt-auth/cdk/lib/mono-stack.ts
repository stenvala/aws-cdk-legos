import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";

const ASSET_LOCATION = "../src/mono/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "mono::Mono.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;
const PREFIX = "mono-";
const TABLE_NAME = "MonoDataTable";

export class MonoStack {
  lambda: lambda.Function;
  apigw: apigw.LambdaRestApi;

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string) {
    this.prefix = prefix + PREFIX;
    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
      memorySize: 1024,
    });

    this.apigw = new apigw.LambdaRestApi(stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    const table = new dynamodb.Table(stack, PREFIX + "Table", {
      partitionKey: {
        name: "Id",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: TABLE_NAME,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ps = new iam.PolicyStatement();
    ps.addActions("dynamodb:*");
    ps.addResources(`${table.tableArn}/index/*`, table.tableArn);

    this.lambda.addToRolePolicy(ps);

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }
}
