import * as cdk from "aws-cdk-lib";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Props } from "./props";

const RUNTIME = lambda.Runtime.PYTHON_3_8;
const ASSET_LOCATION = "../output/api";
const HANDLER = "main.handler";
const ASSETS = lambda.Code.fromAsset(ASSET_LOCATION);

export class Lambda {
  constructor(stack: cdk.Stack, props: Props) {
    const fun = new lambda.Function(stack, "Lambda", {
      runtime: RUNTIME,
      code: ASSETS,
      handler: HANDLER,
      vpc: props.constructs.vpc!,
      vpcSubnets: {
        subnets: props.constructs.privateSubnets,
      },
      environment: {
        DB_HOSTNAME: props.constructs.dbCluters!.clusterEndpoint.hostname,
        DB_PORT: props.constructs.dbCluters!.clusterEndpoint.port.toString(),
        DB_SOCKET_ADDRESS:
          props.constructs.dbCluters!.clusterEndpoint.socketAddress,
      },
      securityGroups: [props.constructs.securityGroupApi!],
      logRetention: logs.RetentionDays.ONE_DAY,
    });
    const api = new apigw.LambdaRestApi(stack, "ApiGw", {
      handler: fun,
      proxy: true,
    });

    props.constructs.dbCluters!.grant(fun, "*");

    new cdk.CfnOutput(stack, "Url", { value: api.url });
  }
}
