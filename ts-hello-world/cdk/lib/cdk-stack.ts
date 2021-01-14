import * as apigw from "@aws-cdk/aws-apigateway";
import * as cm from "@aws-cdk/aws-certificatemanager";
import * as lambda from "@aws-cdk/aws-lambda";
import * as route53 from "@aws-cdk/aws-route53";
import * as cdk from "@aws-cdk/core";

const PREFIX = "TSHelloWorld-";

const ACM_CERTIFICATE_ARN =
  "arn:aws:acm:eu-north-1:725670626446:certificate/ba843083-bf89-4018-8232-0b56f16da483";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, PREFIX + id, props);

    const name = new lambda.Function(this, PREFIX + "Lambda", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("../dist"),
      handler: "app.lambdaHandler",
    });

    const api = new apigw.LambdaRestApi(this, PREFIX + "ApiGw", {
      handler: name,
      proxy: true,
    });

    new cdk.CfnOutput(this, "url", { value: api.url });

    const custom = new apigw.DomainName(this, "customDomain", {
      domainName: "www.osallistujat.com",
      certificate: cm.Certificate.fromCertificateArn(
        this,
        "ACM_Certificate",
        ACM_CERTIFICATE_ARN
      ) as any,
      endpointType: apigw.EndpointType.REGIONAL,
    });

    // Associate the Custom domain that we created with new APIGateway using BasePathMapping:
    new apigw.BasePathMapping(this, "CustomBasePathMapping", {
      domainName: custom,
      restApi: api,
    });

    // Get a reference to AN EXISTING hosted zone using the HOSTED_ZONE_ID. You can get this from route53
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId: "Z097579113AAQ32Z4M1K7",
        zoneName: "osallistujat.com",
      }
    );

    // Finally, add a CName record in the hosted zone with a value of the new custom domain that was created above:
    new route53.CnameRecord(this, "ApiGatewayRecordSet", {
      zone: hostedZone,
      recordName: "api",
      domainName: custom.domainNameAliasDomainName,
    });
  }
}
