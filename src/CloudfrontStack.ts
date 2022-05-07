import {
  Stack,
  StackProps,
  Duration,
  aws_route53 as Route53,
  aws_route53_targets as Route53Targets,
  aws_s3 as S3,
  aws_s3_deployment,
  aws_iam as IAM,
} from 'aws-cdk-lib';
import {
  Distribution,
  PriceClass,
  AllowedMethods,
  ResponseHeadersPolicy,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  SecurityPolicyProtocol,
  OriginAccessIdentity,
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

    this.setCloudfrontStack(props.hostDomain, domains);
    //this.addStaticResources(cloudfrontDistribution);
    //this.addDnsRecords(cloudfrontDistribution);
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


  /**
   * Get a set of (security) response headers to inject into the response
   * @returns {ResponseHeadersPolicy} cloudfront responseHeadersPolicy
   */
  responseHeadersPolicy(): ResponseHeadersPolicy {

    const responseHeadersPolicy = new ResponseHeadersPolicy(this, 'headers', {
      securityHeadersBehavior: {
        contentSecurityPolicy: { contentSecurityPolicy: this.cspHeaderValue(), override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: HeadersReferrerPolicy.NO_REFERRER, override: true },
        strictTransportSecurity: { accessControlMaxAge: Duration.days(366), includeSubdomains: true, override: true },
      },
    });
    return responseHeadersPolicy;
  }

  /**
   * Get the cleaned, trimmed header values for the csp header
   *
   * @returns string csp header values
   */
  cspHeaderValue() {
    const cspValues = 'default-src \'self\';\
    frame-ancestors \'self\';\
    frame-src \'self\';\
    connect-src \'self\' https://componenten.nijmegen.nl;\
    style-src \'self\' https://componenten.nijmegen.nl https://fonts.googleapis.com https://fonts.gstatic.com \
    \'sha256-hS1LM/30PjUBJK3kBX9Vm9eOAhQNCiNhf/SCDnUqu14=\' \'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=\' \'sha256-OTeu7NEHDo6qutIWo0F2TmYrDhsKWCzrUgGoxxHGJ8o=\';\
    script-src \'self\' https://componenten.nijmegen.nl https://siteimproveanalytics.com;\
    font-src \'self\' https://componenten.nijmegen.nl https://fonts.gstatic.com;\
    img-src \'self\' https://componenten.nijmegen.nl data: https://*.siteimproveanalytics.io;\
    object-src \'none\';\
    ';
    return cspValues.replace(/[ ]+/g, ' ').trim();
  }

  /**
   * Create an s3 bucket to hold static resources.
   * Must be unencrypted to allow cloudfront to serve
   * these resources.
   *
   * @returns S3.Bucket
   */
  staticResourcesBucket() {
    const bucket = new S3.Bucket(this, 'resources-bucket', {
      blockPublicAccess: S3.BlockPublicAccess.BLOCK_ALL,
      encryption: S3.BucketEncryption.UNENCRYPTED,
    });

    return bucket;
  }

  /**
   * Allow listBucket to the origin access identity
   *
   * Necessary so cloudfront receives 404's as 404 instead of 403. This also allows
   * a listing of the bucket if no /index.html is present in the bucket.
   *
   * @param originAccessIdentity
   * @param bucket
   */
  allowOriginAccessIdentityAccessToBucket(originAccessIdentity: OriginAccessIdentity, bucket: Bucket) {
    bucket.addToResourcePolicy(new IAM.PolicyStatement({
      resources: [
        `${bucket.bucketArn}`,
        `${bucket.bucketArn}/*`,
      ],
      actions: [
        's3:GetObject',
        's3:ListBucket',
      ],
      effect: IAM.Effect.ALLOW,
      principals: [originAccessIdentity.grantPrincipal],
    }),
    );
  }

  /**
   * Deploy contents of folder to the s3 bucket
   *
   * Invalidates the correct cloudfront path
   * @param bucket s3.Bucket
   * @param distribution Distribution
   */
  deployBucket(bucket: S3.Bucket, distribution: Distribution) {
    //Deploy static resources to s3
    new aws_s3_deployment.BucketDeployment(this, 'staticResources', {
      sources: [aws_s3_deployment.Source.asset('./src/app/static-resources/')],
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/static/*'],
    });
  }
}