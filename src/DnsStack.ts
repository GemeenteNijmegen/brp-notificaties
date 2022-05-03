import { aws_route53 as Route53, Stack, StackProps, aws_ssm as SSM } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export interface DnsStackProps extends StackProps {
  branch: string;
}

/**
 * Dns stuff for brp-notificaties
 * Note this stack must be in us-east-1
 */
export class DnsStack extends Stack {
  zone: Route53.HostedZone;
  accountRootZone: Route53.IHostedZone;
  branch: string;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id);
    this.branch = props.branch;

    // Import root zone
    const rootZoneId = SSM.StringParameter.valueForStringParameter(this, Statics.ssmEnvRootHostedZoneId);
    const rootZoneName = SSM.StringParameter.valueForStringParameter(this, Statics.ssmEnvRootHostedZoneName);
    this.accountRootZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'account-zone', {
      hostedZoneId: rootZoneId,
      zoneName: rootZoneName,
    });

    // Create the sub zone (subdomain)
    this.zone = new Route53.HostedZone(this, 'zone', {
      zoneName: `brp-notificaties.${this.accountRootZone.zoneName}`,
    });

    // Register the subdomain
    if (this.zone.hostedZoneNameServers == undefined) {
      throw 'brp-notificaties sub hosted zone does not contain nameservers cannot create a zone delegation record';
    }
    new Route53.ZoneDelegationRecord(this, 'zone-delegation', {
      nameServers: this.zone.hostedZoneNameServers,
      zone: this.zone,
    });

    // Export sub zone paramters
    this.addZoneIdAndNametoParams();

  }

  /**
   * Export zone id and name to parameter store
   * for use in other stages (Cloudfront).
   */
  private addZoneIdAndNametoParams() {
    new SSM.StringParameter(this, 'brp-events-hostedzone-id', {
      stringValue: this.zone.hostedZoneId,
      parameterName: Statics.ssmZoneId,
    });

    new SSM.StringParameter(this, 'brp-events-hostedzone-name', {
      stringValue: this.zone.zoneName,
      parameterName: Statics.ssmZoneName,
    });
  }

}