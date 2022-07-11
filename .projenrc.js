const { GemeenteNijmegenCdkApp } = require('@gemeentenijmegen/modules-projen');
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.27.0', // min cdk version (projen converts this to ^2.27.0 and upgrades it in the package.json with the upgrade task)
  name: 'brp-notificaties',
  defaultReleaseBranch: 'production',
  majorVersion: 0,
  deps: [
    '@gemeentenijmegen/modules-projen',
    'cdk-nag@^2.0.0',
    '@types/aws-lambda',
    'dotenv',
    '@aws-cdk/aws-apigatewayv2-alpha',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha',
    'cdk-remote-stack',
    'aws-sdk',
  ],
  enableCfnDiffWorkflow: false,
  enableCfnLintOnGithub: true,
  enableEmergencyProcedure: true,
});

project.synth();
