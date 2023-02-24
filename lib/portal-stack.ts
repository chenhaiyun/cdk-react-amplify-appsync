import * as path from 'path';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import {
  Aws,
  RemovalPolicy,
  aws_s3 as s3,
  aws_cloudfront as cloudfront,
  aws_s3_deployment as s3d,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Stack to provision Portal assets and CloudFront Distribution
 */
export class PortalStack extends Construct {
  readonly portalBucket: s3.Bucket;
  readonly portalUrl: string;
  readonly cloudFrontDistributionId: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Use cloudfrontToS3 solution contructs
    const portal = new CloudFrontToS3(this, 'UI', {
      bucketProps: {
        versioned: false,
        encryption: s3.BucketEncryption.S3_MANAGED,
        accessControl: s3.BucketAccessControl.PRIVATE,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.RETAIN,
        autoDeleteObjects: false,
      },
      cloudFrontDistributionProps: {
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
        enableIpv6: false,
        enableLogging: false, //Enable access logging for the distribution.
        comment: `${Aws.STACK_NAME} - Web Console Distribution (${Aws.REGION})`,
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
          },
        ],
        // defaultBehavior: getDefaultBehavior(),
      },
      insertHttpSecurityHeaders: false,
    });
    
    this.portalBucket = portal.s3Bucket as s3.Bucket;
    const portalDist = portal.cloudFrontWebDistribution.node
      .defaultChild as cloudfront.CfnDistribution;

    portalDist.addPropertyOverride(
      'DistributionConfig.DefaultCacheBehavior.CachePolicyId',
      undefined
    );
    portalDist.addPropertyOverride(
      'DistributionConfig.DefaultCacheBehavior.ForwardedValues',
      {
        Cookies: {
          Forward: 'none',
        },
        QueryString: false,
      }
    );

    this.portalUrl = portal.cloudFrontWebDistribution.distributionDomainName;
    this.cloudFrontDistributionId =
      portal.cloudFrontWebDistribution.distributionId;

    // upload static web assets
    new s3d.BucketDeployment(this, 'DeployWebAssets', {
      sources: [
        s3d.Source.asset(path.join(__dirname, '../frontend/build')),
      ],
      destinationBucket: this.portalBucket,
      prune: false,
    });

    // Output portal Url
    new CfnOutput(this, "WebsiteURL", {
      description: "CDK Project Website URL (front-end)",
      value: this.portalUrl,
    }).overrideLogicalId("WebsiteURL");
  }
}
