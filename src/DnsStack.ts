import { aws_route53 as Route53, Stack, StackProps, aws_ssm as SSM, Stage, StageProps } from 'aws-cdk-lib';
import { RemoteParameters } from 'cdk-remote-stack';
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

    const parameters = new RemoteParameters(this, 'account-zone-params', {
      path: Statics.ssmEnvRootHostedParams,
      region: 'eu-west-1',
    });

    const rootZoneId = parameters.get(Statics.ssmEnvRootHostedZoneId);
    const rootZoneName = parameters.get(Statics.ssmEnvRootHostedZoneName);
    this.accountRootZone = Route53.HostedZone.fromHostedZoneAttributes(this, 'account-zone', {
      hostedZoneId: rootZoneId,
      zoneName: rootZoneName,
    });

    this.zone = new Route53.HostedZone(this, 'zone', {
      zoneName: `brp-notificaties.${this.accountRootZone.zoneName}`,
    });

    if (this.zone.hostedZoneNameServers == undefined) {
      throw 'brp-notificaties sub hosted zone does not contain nameservers cannot create a zone delegation record';
    }

    new Route53.ZoneDelegationRecord(this, 'zone-delegation', {
      nameServers: this.zone.hostedZoneNameServers,
      zone: this.accountRootZone,
    });

    this.addZoneIdAndNametoParams();

    // Development (sandbox) does not have a kms key
    if (Statics.isDevelopment(props.branch)) {
      this.setupDnsSec();
    }

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

export interface DnsStageProps extends StageProps{
  branch: string;
}

export class DnsStage extends Stage {

  constructor(scope: Construct, id: string, props: DnsStageProps) {
    super(scope, id, props);

    new DnsStack(this, 'dns-stack', {
      branch: props.branch,
    });

    //Aspects.of(dnsStack).add(new AwsSolutionsChecks());

  }

}