import { Stack, StackProps, Tags, pipelines, Environment } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiStage } from './ApiStage';
import { DnsStage } from './DnsStack';
import { Statics } from './Statics';

export interface PipelineStackProps extends StackProps{
  branchName: string;
  deployToEnvironment: Environment;
}

export class PipelineStack extends Stack {

  branchName: string;

  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    this.branchName = props.branchName;

    const pipeline = this.pipeline();

    pipeline.addStage(new ApiStage(this, 'brp-notificaties', {
      env: props.deployToEnvironment,
      branch: props.branchName,
    }));

    pipeline.addStage(new DnsStage(this, 'brp-notificaties-us-east-1', {
      env: {
        account: props.deployToEnvironment.account,
        region: 'us-east-1',
      },
      branch: props.branchName,
    }));

  }

  pipeline(): pipelines.CodePipeline {

    const source = pipelines.CodePipelineSource.connection(Statics.projectRepo, this.branchName, {
      connectionArn: Statics.codeStarConnectionArn,
    });

    const pipeline = new pipelines.CodePipeline(this, `brp-notificaties-${this.branchName}`, {
      pipelineName: `brp-notificaties-${this.branchName}`,
      dockerEnabledForSelfMutation: true,
      dockerEnabledForSynth: true,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        env: {
          BRANCH_NAME: this.branchName,
        },
        commands: [
          'yarn install --frozen-lockfile',
          'yarn build',
        ],
      }),
    });
    return pipeline;
  }
}