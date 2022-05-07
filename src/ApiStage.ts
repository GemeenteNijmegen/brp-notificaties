import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStack } from './ApiStack';
import { CertificateStack } from './CertificateStack';
import { CloudfrontStack } from './CloudfrontStack';
import { DnsSecStack } from './DnsSecStack';
import { DnsStack } from './DnsStack';
import { Statics } from './Statics';

export interface ApiStageProps extends StageProps {
  branch: string;
}

/**
 * Stage responsible for the API Gateway and lambdas
 */
export class ApiStage extends Stage {

  constructor(scope: Construct, id: string, props: ApiStageProps) {
    super(scope, id, props);

    const certStack = new CertificateStack(this, 'cert-stack', {
      env: { region: 'us-east-1' },
      branch: props.branch,
    });

    const apiStack = new ApiStack(this, 'api-stack', {
      branch: props.branch,
      description: 'API gateway and lambdas for BRP-events',
    });
    apiStack.addDependency(certStack);

    const dnsStack = new DnsStack(this, 'dns-stack', {
      branch: props.branch,
    });
    dnsStack.addDependency(apiStack);

    new CloudfrontStack(this, 'cloudfront-stack', {
      branch: props.branch,
      hostDomain: apiStack.domain(),
    });
    console.log(apiStack.domain());

    // Only deploy dnssec on non dev branches
    if (!Statics.isDevelopment(props.branch)) {
      new DnsSecStack(this, 'dnssec-stack', {
        branch: props.branch,
      });
    }

    // cfn-nag for all stacks in this stage.
    //Aspects.of(apiStack).add(new AwsSolutionsChecks());

  }


}