import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { PipelineStackAcceptance } from './PipelineStackAcceptance';
import { PipelineStackDevelopment } from './PipelineStackDevelopment';
import { PipelineStackProduction } from './PipelineStackProduction';

const app = new App();


const deploymentEnvironment = {
  account: '418648875085',
  region: 'eu-west-1',
};

const sandboxEnvironment = {
  account: '122467643252',
  region: 'eu-west-1',
};

const acceptanceEnvironment = {
  account: '315037222840',
  region: 'eu-west-1',
};

const productionEnvironment = {
  account: '196212984627',
  region: 'eu-west-1',
};

if ('BRANCH_NAME' in process.env == false || process.env.BRANCH_NAME == 'development') {
  new PipelineStackDevelopment(app, 'mijnuitkering-pipeline-development',
    {
      env: deploymentEnvironment,
      branchName: 'development',
      deployToEnvironment: sandboxEnvironment,
    },
  );
} else if (process.env.BRANCH_NAME == 'acceptance') {
  new PipelineStackAcceptance(app, 'mijnuitkering-pipeline-acceptance',
    {
      env: deploymentEnvironment,
      branchName: 'acceptance',
      deployToEnvironment: acceptanceEnvironment,
    },
  );
} else if (process.env.BRANCH_NAME == 'production') {
  new PipelineStackProduction(app, 'mijnuitkering-pipeline-production',
    {
      env: deploymentEnvironment,
      branchName: 'production',
      deployToEnvironment: productionEnvironment,
    },
  );
}

Aspects.of(app).add(new AwsSolutionsChecks());

app.synth();