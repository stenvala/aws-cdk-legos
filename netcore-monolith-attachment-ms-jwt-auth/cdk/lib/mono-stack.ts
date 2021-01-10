import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { Duration } from "@aws-cdk/core";
import { AuthStack } from "./auth-stack";
import { CdkStack } from "./cdk-stack";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/mono/bin/Release/netcoreapp3.1/linux-x64";
const HANDLER = "mono::Mono.LambdaEntryPoint::FunctionHandlerAsync";
const RUNTIME = lambda.Runtime.DOTNET_CORE_3_1;
const PREFIX = "mono-";
const TABLE_NAMES = ["MonoUser", "MonoDocument"];

export class MonoStack {
  lambda: lambda.Function;
  apigw: apigw.LambdaRestApi;

  private readonly prefix: string;

  constructor(
    private stack: CdkStack,
    prefix: string,
    authStack: AuthStack,
    props: GlobalProps
  ) {
    this.prefix = prefix + PREFIX;

    this.lambda = new lambda.Function(stack, this.prefix + "Lambda", {
      runtime: RUNTIME,
      code: lambda.Code.fromAsset(ASSET_LOCATION),
      handler: HANDLER,
      timeout: Duration.seconds(10),
      memorySize: 1024,
      environment: {
        authUrl: authStack.apigw.url + "jwt",
        amisAuthType: props.amisAuth,
      },
    });

    this.apigw = new apigw.LambdaRestApi(stack, this.prefix + "ApiGw", {
      handler: this.lambda,
      proxy: true,
    });

    TABLE_NAMES.forEach((i) => {
      const table = this.getTable(i);
      const ps = new iam.PolicyStatement();
      ps.addActions("dynamodb:*");
      ps.addResources(`${table.tableArn}/index/*`, table.tableArn);
      this.lambda.addToRolePolicy(ps);
    });

    new cdk.CfnOutput(stack, PREFIX + "Url", { value: this.apigw.url });
  }

  private getTable(tableName: string) {
    return new dynamodb.Table(this.stack, this.prefix + "Table" + tableName, {
      partitionKey: {
        name: "Id",
        type: dynamodb.AttributeType.STRING,
      },
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
