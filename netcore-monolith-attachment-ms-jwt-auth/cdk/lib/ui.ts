import {
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  IOriginAccessIdentity,
  OriginAccessIdentity,
} from "@aws-cdk/aws-cloudfront";
import * as iam from "@aws-cdk/aws-iam";
import * as S3 from "@aws-cdk/aws-s3";
import * as S3Deployment from "@aws-cdk/aws-s3-deployment";
import * as cdk from "@aws-cdk/core";

const ASSET_LOCATION = "../src/ui/dist";
const PREFIX = "ui-";
const INDEX = "/index.html";
const BUCKET_NAME = "amis-ui";

// Seems good example:
// https://github.com/nideveloper/CDK-SPA-Deploy

export class UI {
  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string) {
    this.prefix = prefix + PREFIX;

    const bucket = this.getBucket(stack);

    const cloudFrontOAI = new OriginAccessIdentity(stack, this.prefix + "oai");

    const cloudfrontDist = new CloudFrontWebDistribution(
      stack,
      this.prefix + "cfd",
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

    new cdk.CfnOutput(stack, PREFIX + "Url", {
      value: "https://" + cloudfrontDist.distributionDomainName,
    });
  }

  private getBucket(stack: cdk.Stack) {
    const bucket = new S3.Bucket(stack, this.prefix + "bucket", {
      bucketName: BUCKET_NAME,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: false, // This is accessed via cloudfront
    });

    new S3Deployment.BucketDeployment(
      stack,
      this.prefix + "bucket-deployment1",
      {
        sources: [
          S3Deployment.Source.asset(ASSET_LOCATION, {
            exclude: ["index.html"],
          }),
        ],
        cacheControl: [
          S3Deployment.CacheControl.fromString(
            "max-age=604800,public,immutable"
          ),
        ],
        destinationBucket: bucket as any,
        prune: true,
      }
    );

    new S3Deployment.BucketDeployment(
      stack,
      this.prefix + "bucket-deployment2",
      {
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
        prune: true,
      }
    );
    return bucket;
  }

  private getCFWDProps(
    bucket: S3.Bucket,
    oai: IOriginAccessIdentity
  ): CloudFrontWebDistributionProps {
    return {
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
  }
}
