import { aws_route53 as Route53, Stack, StackProps } from 'aws-cdk-lib';
import { RemoteParameters } from 'cdk-remote-stack';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export interface DnsSecStackProps extends StackProps {
  branch: string;
}

/**
 * DnsSec stuff for brp-notificaties
 * Note this stack must be in us-east-1
 */
export class DnsSecStack extends Stack {
  zone: Route53.IHostedZone;
  branch: string;

  constructor(scope: Construct, id: string, props: DnsSecStackProps) {
    super(scope, id);
    this.branch = props.branch;

    const parameters = new RemoteParameters(this, 'account-zone-params', {
      path: Statics.ssmZoneParams,
      region: 'eu-west-1',
    });

    this.zone = Route53.HostedZone.fromHostedZoneAttributes(this, 'zone', {
      hostedZoneId: parameters.get(Statics.ssmZoneId),
      zoneName: parameters.get(Statics.ssmZoneName),
    });

    this.setupDnsSec();

  }

  /**
     * Setup dnssec for our new subdomain
     */
  private setupDnsSec() {

    // Use the account kms key for dnssec (this stack should be in us-east-1)
    const dnssecKeySigning = new Route53.CfnKeySigningKey(this, 'dnssec-keysigning-key', {
      name: 'ksk_brp_notificaties',
      status: 'ACTIVE',
      hostedZoneId: this.zone.hostedZoneId,
      keyManagementServiceArn: Statics.ssmAccountDnsSecKmsKey,
    });

    // Setup the actual dnssec
    const dnssec = new Route53.CfnDNSSEC(this, 'dnssec', {
      hostedZoneId: this.zone.hostedZoneId,
    });
    dnssec.node.addDependency(dnssecKeySigning);
  }

}