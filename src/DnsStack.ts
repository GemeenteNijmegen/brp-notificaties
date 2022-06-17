import {
  Stack,
  StackProps,
  aws_route53 as Route53,
  aws_ssm as SSM,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';
import { Utils } from './Utils';

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

    // Import account root zone
    this.accountRootZone = Utils.importAccountRootZone(this);

    // Create the sub zone (subdomain)
    const domainname = Statics.getDomainName(props.branch);
    this.zone = new Route53.HostedZone(this, 'zone', {
      zoneName: domainname,
    });

    this.registerSubHostedzone(Statics.subdomain);
    this.addZoneIdAndNametoParams();

  }

  /**
   * Register sub hosted zone with account root zone
   */
  private registerSubHostedzone(subdomain: string) {
    if (this.zone.hostedZoneNameServers == undefined) {
      throw 'brp-notificaties sub hosted zone does not contain nameservers cannot create a zone delegation record';
    }
    new Route53.NsRecord(this, 'zone-delegation', {
      values: this.zone.hostedZoneNameServers,
      zone: this.accountRootZone,
      recordName: subdomain,
    });
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