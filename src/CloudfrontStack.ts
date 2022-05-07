import {
  Stack,
  StackProps,
  Duration,
  aws_route53 as Route53,
  aws_route53_targets as Route53Targets,
} from 'aws-cdk-lib';
import {
  Distribution,
  PriceClass,
  AllowedMethods, SecurityPolicyProtocol, ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Statics } from './Statics';
import { Utils } from './Utils';

export interface CloudFrontStackProps extends StackProps {
  /**
     * Domain for the default origin (HTTPorigin)
     */
  hostDomain: string;
  /**
     * current branch: Determines subdomain of csp-nijmegen.nl
     */
  branch: string;
}

export class CloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id);

    const domain = Statics.getDomainName(props.branch);
    const domains = [domain];

    const cloudfrontDistribution = this.setCloudfrontStack(props.hostDomain, domains);
    this.addDnsRecords(cloudfrontDistribution);
  }

  /**
   * Create a cloudfront distribution for the application
   *
   * Do not forward the Host header to API Gateway. This results in
   * an HTTP 403 because API Gateway won't be able to find an endpoint
   * on the cloudfront domain.
   *
   * @param {string} apiGatewayDomain the domain the api gateway can be reached at
   * @returns {Distribution} the cloudfront distribution
   */
  setCloudfrontStack(apiGatewayDomain: string, domainNames?: string[]): Distribution {

    const certificate = Utils.importCertificateFromUsEast1(this);

    const distribution = new Distribution(this, 'cf-distribution', {
      priceClass: PriceClass.PRICE_CLASS_100,
      domainNames,
      certificate,
      defaultBehavior: {
        origin: new HttpOrigin(apiGatewayDomain),
        allowedMethods: AllowedMethods.ALLOW_ALL,
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      },
      logBucket: this.logBucket(),
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
    });
    return distribution;
  }

  /**
   * Add DNS records for cloudfront to the Route53 Zone
   *
   * Requests to the custom domain will correctly use cloudfront.
   *
   * @param distribution the cloudfront distribution
   */
  addDnsRecords(distribution: Distribution) {
    const zone = Utils.importHostedZoneFromEuWest1(this);

    new Route53.ARecord(this, 'a-record', {
      zone: zone,
      target: Route53.RecordTarget.fromAlias(new Route53Targets.CloudFrontTarget(distribution)),
    });

    new Route53.AaaaRecord(this, 'aaaa-record', {
      zone: zone,
      target: Route53.RecordTarget.fromAlias(new Route53Targets.CloudFrontTarget(distribution)),
    });
  }

  /**
   * Create a bucket to hold cloudfront logs
   * @returns s3.Bucket
   */
  logBucket() {
    const cfLogBucket = new Bucket(this, 'CloudfrontLogs', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      lifecycleRules: [
        {
          id: 'delete objects after 180 days',
          enabled: true,
          expiration: Duration.days(180),
        },
      ],
    });
    return cfLogBucket;
  }

}