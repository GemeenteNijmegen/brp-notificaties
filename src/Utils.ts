import {
  aws_route53 as Route53,
  aws_certificatemanager as certificatemanager,
} from 'aws-cdk-lib';
import { RemoteParameters } from 'cdk-remote-stack';
import { Construct } from 'constructs';
import { Statics } from './Statics';

export class Utils {

  static importHostedZoneFromEuWest1(stack: Construct) {
    const parameters = new RemoteParameters(stack, 'import-account-zone-params', {
      path: Statics.ssmZoneParams,
      region: 'eu-west-1',
    });

    return Route53.HostedZone.fromHostedZoneAttributes(stack, 'import-zone', {
      hostedZoneId: parameters.get(Statics.ssmZoneId),
      zoneName: parameters.get(Statics.ssmZoneName),
    });
  }

  static importCertificateFromUsEast1(stack: Construct) {
    const parameters = new RemoteParameters(stack, 'import-certificate-params', {
      path: Statics.ssmCertificatePath,
      region: 'us-east-1',
    });

    const arn = parameters.get(Statics.ssmCertificateArn);
    return certificatemanager.Certificate.fromCertificateArn(stack, 'import-certificate', arn);

  }

}