import { Stack, StackProps, Tags, pipelines, Environment, aws_ssm as SSM } from 'aws-cdk-lib';
import { Construct } from 'constructs';
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
    //const pipeline = this.pipeline();

  }

  pipeline(): pipelines.CodePipeline {
    const connectionArn = SSM.StringParameter.valueForStringParameter(this, Statics.codeStarConnectionArn);

    const source = pipelines.CodePipelineSource.connection(Statics.projectRepo, this.branchName, {
      connectionArn: connectionArn,
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