import { Aspects, Stage, StageProps } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { Construct } from 'constructs';
import { DnsStack } from './DnsStack';

export interface ApiStageProps extends StageProps {
  branch: string;
}

/**
 * Stage responsible for the API Gateway and lambdas
 */
export class ApiStage extends Stage {

  constructor(scope: Construct, id: string, props: ApiStageProps) {
    super(scope, id, props);

    const dnsStack = new DnsStack(this, 'dns-stack', {
      branch: props.branch,
      env: {
        region: 'us-east-1',
      },
    });


    // cfn-nag for all stacks in this stage.
    Aspects.of(dnsStack).add(new AwsSolutionsChecks());

  }


}