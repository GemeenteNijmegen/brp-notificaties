import {
  Stack,
  StackProps,
  aws_ssm as SSM,
  aws_s3 as S3,
  aws_apigateway as apigateway,
  aws_certificatemanager as certificatemanager,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebhookFunction } from './app/webhook-function';
import { Statics } from './Statics';

export interface ApiStackProps extends StackProps {
  branch: string;
}

/**
 * The API Stack with api gateway
 */
export class ApiStack extends Stack {

  api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const certificateArn = SSM.StringParameter.valueForStringParameter(this, Statics.ssmCertificateArn);
    const cert = certificatemanager.Certificate.fromCertificateArn(this, 'certificate', certificateArn);

    this.api = new apigateway.RestApi(this, 'api-gateway', {
      description: 'BRP notificaties api',
      domainName: {
        domainName: Statics.getDomainName(props.branch),
        certificate: cert,
      },
    });

    // Store apigateway ID to be used in other stacks
    new SSM.StringParameter(this, 'ssm_api_1', {
      stringValue: this.api.restApiId,
      parameterName: Statics.ssmApiGatewayId,
    });

    this.setFunctions();
    //this.setDnsRecords();

  }

  /**
   * Create and configure lambda's for all api routes, and
   * add routes to the gateway.
   */
  setFunctions() {

    const eventStore = new S3.Bucket(this, 'event-store-bucket');

    const webhook = new WebhookFunction(this, 'webhook', {
      description: 'Webhook for brp events',
      environment: {
        EVENT_STORE_BUCKET: eventStore.bucketName,
      },
    });
    eventStore.grantWrite(webhook);

    this.api.root.addMethod('POST', new apigateway.LambdaIntegration(webhook));

  }

  // setDnsRecords() {
  //   // Import hosted zone
  //   const zone = Utils.importHostedZoneFromEuWest1(this);
  //   new Route53.ARecord(this, 'a', {
  //     zone: zone,
  //     target: Route53.RecordTarget.fromAlias(new Route53Targets.ApiGateway(this.api)),
  //   });
  //   new Route53.AaaaRecord(this, 'aaaa', {
  //     zone: zone,
  //     target: Route53.RecordTarget.fromAlias(new Route53Targets.ApiGateway(this.api)),
  //   });
  // }

  /**
   * Clean and return the apigateway subdomain placeholder
   * https://${Token[TOKEN.246]}.execute-api.eu-west-1.${Token[AWS.URLSuffix.3]}/
   * which can't be parsed by the URL class.
   *
   * @returns a domain-like string cleaned of protocol and trailing slash
   */
  domain(): string {
    const url = this.api.url;
    if (!url) { return ''; }
    let cleanedUrl = url
      .replace(/^https?:\/\//, '') //protocol
      .replace(/\/$/, ''); //optional trailing slash
    return cleanedUrl;
  }
}