import {
  aws_certificatemanager as CertificateManager,
  Stack,
  StackProps,
  aws_ssm as SSM,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './Statics';
import { Utils } from './Utils';

export interface CertificateStackProps extends StackProps {
  branch: string;
}

export class CertificateStack extends Stack {
  private branch: string;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);
    this.branch = props.branch;
    this.createCertificate();
  }

  createCertificate() {
    const subdomain = Statics.getDomainName(this.branch);

    const zone = Utils.importHostedZoneFromEuWest1(this);

    const certificate = new CertificateManager.Certificate(this, 'certificate', {
      domainName: subdomain,
      //   subjectAlternativeNames: [`${subdomain}.nijmegen.nl`],
      validation: CertificateManager.CertificateValidation.fromDns(zone),
    });

    new SSM.StringParameter(this, 'cert-arn', {
      stringValue: certificate.certificateArn,
      parameterName: Statics.ssmCertificateArn,
    });

    return certificate;
  }
}