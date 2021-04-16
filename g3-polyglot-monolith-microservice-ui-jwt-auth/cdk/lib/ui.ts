import {
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  IOriginAccessIdentity,
  OriginAccessIdentity,
  SSLMethod,
} from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import * as S3 from "@aws-cdk/aws-s3";
import * as S3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cdk from "@aws-cdk/core";
import { GlobalProps } from "./models";

const ASSET_LOCATION = "../src/ui/dist";
const PREFIX = "ui-";
const INDEX = "/index.html";
const BUCKET_NAME = "amis-ui-files";

// Seems good example:
// https://github.com/nideveloper/CDK-SPA-Deploy

export class UI {
  constructor(stack: cdk.Stack, private props: GlobalProps) {
    const bucket = this.getBucket(stack);

    const cloudFrontOAI = new OriginAccessIdentity(stack, PREFIX + "OAI");

    const cloudfrontDist = new CloudFrontWebDistribution(
      stack,
      PREFIX + "cfd",
      this.getCFWDProps(bucket, cloudFrontOAI)
    );

    const cloudfrontS3Access = new iam.PolicyStatement();
    cloudfrontS3Access.addActions("s3:GetBucket*");
    cloudfrontS3Access.addActions("s3:GetObject*");
    cloudfrontS3Access.addActions("s3:List*");
    cloudfrontS3Access.addResources(bucket.bucketArn);
    cloudfrontS3Access.addResources(`${bucket.bucketArn}/*`);
    cloudfrontS3Access.addCanonicalUserPrincipal(
      cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );

    if (props.useCustomDomainName) {
      props.customDomainNameFactory!.createCNameRecord(
        "ui",
        cloudfrontDist.distributionDomainName
      );
      new cdk.CfnOutput(stack, "ui", {
        value: props.customDomainNameFactory!.getUrl("ui"),
      });
    }

    new cdk.CfnOutput(stack, PREFIX + "Url", {
      value: "https://" + cloudfrontDist.distributionDomainName,
    });
  }

  private getBucket(stack: cdk.Stack) {
    const bucket = new S3.Bucket(stack, PREFIX + "Bucket", {
      bucketName: BUCKET_NAME,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false, // This is accessed via cloudfront
    });

    new S3Deployment.BucketDeployment(stack, PREFIX + "bucket-deployment1", {
      sources: [
        S3Deployment.Source.asset(ASSET_LOCATION, {
          exclude: ["index.html"],
        }),
      ],
      cacheControl: [
        S3Deployment.CacheControl.fromString("max-age=604800,public,immutable"),
      ],
      destinationBucket: bucket as any,
      prune: false,
    });

    new S3Deployment.BucketDeployment(stack, PREFIX + "bucket-deployment2", {
      sources: [
        S3Deployment.Source.asset(ASSET_LOCATION, {
          exclude: ["*", "!index.html"],
        }),
      ],
      cacheControl: [
        S3Deployment.CacheControl.fromString(
          "max-age=60,no-cache,no-store,must-revalidate"
        ),
      ],
      destinationBucket: bucket as any,
      prune: false,
    });
    return bucket;
  }

  private getCFWDProps(
    bucket: S3.Bucket,
    oai: IOriginAccessIdentity
  ): CloudFrontWebDistributionProps {
    let obj = {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket as any, // minor issue in cdk
            originAccessIdentity: oai,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: INDEX,
          responseCode: 200,
        },
        {
          errorCode: 404,
          responsePagePath: INDEX,
          responseCode: 200,
        },
      ],
    };
    if (this.props.useCustomDomainName) {
      obj = Object.assign(obj, {
        viewerCertificate: {
          aliases: [this.props.customDomainNameFactory!.getDomain("ui")],
          props: {
            acmCertificateArn: this.props.customDomainNameFactory!
              .cloundfrontCertificateArn,
            sslSupportMethod: SSLMethod.SNI,
          },
        },
      });
    }
    return obj;
  }
}
