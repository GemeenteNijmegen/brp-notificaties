import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Stack, StackProps, aws_ssm as SSM, aws_s3 as S3 } from 'aws-cdk-lib';
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

  api: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.api = new apigatewayv2.HttpApi(this, 'brp-notificaties-api', {
      description: 'BRP notificaties api',
    });

    // Store apigateway ID to be used in other stacks
    new SSM.StringParameter(this, 'ssm_api_1', {
      stringValue: this.api.httpApiId,
      parameterName: Statics.ssmApiGatewayId,
    });

    this.setFunctions();

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
        EVENT_STORE_ARN: eventStore.bucketName,
      },
    });
    eventStore.grantWrite(webhook);

    this.api.addRoutes({
      integration: new HttpLambdaIntegration('webhook', webhook),
      path: '/',
      methods: [apigatewayv2.HttpMethod.POST],
    });

  }

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