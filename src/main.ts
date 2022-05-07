import { App } from 'aws-cdk-lib';
import { PipelineStackAcceptance } from './PipelineStackAcceptance';
import { PipelineStackDevelopment } from './PipelineStackDevelopment';
import { PipelineStackProduction } from './PipelineStackProduction';
import { Statics } from './Statics';

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

if (Statics.isDevelopment(process.env.BRANCH_NAME)) {
  console.log('Building development branch');
  new PipelineStackDevelopment(app, 'brp-notificaties-pipeline-development',
    {
      env: deploymentEnvironment,
      branchName: 'development',
      deployToEnvironment: sandboxEnvironment,
    },
  );
} else if (Statics.isAcceptance(process.env.BRANCH_NAME)) {
  console.log('Building acceptance branch');
  new PipelineStackAcceptance(app, 'brp-notificaties-pipeline-acceptance',
    {
      env: deploymentEnvironment,
      branchName: 'acceptance',
      deployToEnvironment: acceptanceEnvironment,
    },
  );
} else if (Statics.isProduction(process.env.BRANCH_NAME)) {
  console.log('Building production branch');
  new PipelineStackProduction(app, 'brp-notificaties-pipeline-production',
    {
      env: deploymentEnvironment,
      branchName: 'production',
      deployToEnvironment: productionEnvironment,
    },
  );
}

app.synth();