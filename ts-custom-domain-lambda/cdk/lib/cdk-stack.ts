import * as apigw from "@aws-cdk/aws-apigateway";
import * as cm from "@aws-cdk/aws-certificatemanager";
import * as lambda from "@aws-cdk/aws-lambda";
import * as route53 from "@aws-cdk/aws-route53";
import * as ssm from "@aws-cdk/aws-ssm";
import * as cdk from "@aws-cdk/core";

const PREFIX = "TSCustomDomainName-";

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

    new cdk.CfnOutput(this, "automaticUrl", { value: api.url });

    const subdomain = "my-custom-subdomain";
    const domain = ssm.StringParameter.valueForStringParameter(
      this,
      "/HostedZone/Domain"
    );

    const certificateArn = ssm.StringParameter.valueForStringParameter(
      this,
      "/Certificate/MyDomainArn"
    );

    const custom = new apigw.DomainName(this, "customDomain", {
      domainName: `${subdomain}.${domain}`,
      certificate: cm.Certificate.fromCertificateArn(
        this,
        PREFIX + "Certificate",
        certificateArn
      ) as any,
      endpointType: apigw.EndpointType.REGIONAL,
    });

    // Associate the Custom domain that we created with new APIGateway using BasePathMapping:
    new apigw.BasePathMapping(this, PREFIX + "CustomBasePathMapping", {
      domainName: custom,
      restApi: api,
    });

    const hostedZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      "/HostedZone/MyZone"
    );
    // Get a reference to AN EXISTING hosted zone using the HOSTED_ZONE_ID. You can get this from route53
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      PREFIX + "HostedZone",
      {
        hostedZoneId,
        zoneName: domain,
      }
    );

    // Finally, add a CName record in the hosted zone with a value of the new custom domain that was created above:
    new route53.CnameRecord(this, "ApiGatewayRecordSet", {
      zone: hostedZone,
      recordName: subdomain,
      domainName: custom.domainNameAliasDomainName,
    });

    new cdk.CfnOutput(this, "url", {
      value: `https://${subdomain}.${domain}/`,
    });
  }
}
