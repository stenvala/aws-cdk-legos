import * as apigw from "@aws-cdk/aws-apigateway";
import * as cm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";
import * as ssm from "@aws-cdk/aws-ssm";
import * as cdk from "@aws-cdk/core";

export class CustomDomainNameFactory {
  private _parameters: { [key: string]: string } = {};
  private getParameter(param: string) {
    if (param in this._parameters) {
      return this._parameters[param];
    }
    this._parameters[param] = ssm.StringParameter.valueForStringParameter(
      this.stack,
      param
    );
    return this._parameters[param];
  }

  private _hostedZone: route53.IHostedZone;
  private get hostedZone() {
    if (this._hostedZone) {
      return this._hostedZone;
    }
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this.stack,
      "HostedZone",
      {
        hostedZoneId: this.hostedZoneId,
        zoneName: this.domain,
      }
    );
    this._hostedZone = hostedZone;
    return hostedZone;
  }

  private get domain() {
    return this.getParameter("/HostedZone/Domain");
  }

  get cloundfrontCertificateArn() {
    return this.getParameter("/Certificate/MyCloudfrontDomainArn");
  }

  get certificateArn() {
    return this.getParameter("/Certificate/MyDomainArn");
  }

  private get hostedZoneId() {
    return this.getParameter("/HostedZone/MyZone");
  }

  getUrl(subdomain: string) {
    const domain = this.getDomain(subdomain);
    return `https://${domain}/`;
  }

  getDomain(subdomain: string) {
    return `${subdomain}.${this.domain}`;
  }

  constructor(private stack: cdk.Stack) {}

  createCNameRecord(subdomain: string, value: string) {
    const subdomainCap = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    new route53.CnameRecord(this.stack, "ApiGatewayRecord" + subdomainCap, {
      zone: this.hostedZone,
      recordName: subdomain,
      domainName: value,
    });
  }

  createForSubdomain(
    subdomain: string,
    api: apigw.RestApi,
    outputKey?: string
  ) {
    if (!outputKey) {
      outputKey = subdomain;
    }
    const subdomainCap = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    const mySubdomain = new apigw.DomainName(
      this.stack,
      "CustomDomain" + subdomainCap,
      {
        domainName: `${subdomain}.${this.domain}`,
        certificate: cm.Certificate.fromCertificateArn(
          this.stack,
          "Certificate" + subdomainCap,
          this.certificateArn
        ),
        endpointType: apigw.EndpointType.REGIONAL,
      }
    );

    new apigw.BasePathMapping(
      this.stack,
      "CustomBasePathMapping" + subdomainCap,
      {
        domainName: mySubdomain,
        restApi: api,
      }
    );

    // Finally, add a Cname record in the hosted zone with a value of the new custom domain that was created above
    // Note, there are caches etc and this is not working super nicely
    this.createCNameRecord(subdomain, mySubdomain.domainNameAliasDomainName);

    new cdk.CfnOutput(this.stack, outputKey, {
      value: `https://${subdomain}.${this.domain}/`,
    });
  }
}
