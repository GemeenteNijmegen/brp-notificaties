/**
 * Steps in converting to modules-projen
 * 1. Include dependency to @gemeentenijmegen/modules-projen in deps
 * 2. Import project: `const { GemeenteNijmegenCdkApp } = require('@gemeentenijmegen/modules-projen');`
 * 3. Change project to GemeenteNijmegenCdkApp: `const project = new GemeenteNijmegenCdkApp({`
 * 4. Remove lint script (now set by default)
 * 5. Remove depsUpgradeOptions (now set by default)
 * 6. Remove release (now set by projen default)
 * 7. Remove license (now set by default)
 * 8. Remove projenVersion (use projen upgrade workflow)
 * 9. Keep cdkVersion (this is the minimum cdk version)
 * 10. Remove gitignore property (now set by default in project type)
 * 11. Remove workflowBootstapSteps (setup cfn-lint, now handled by project type)
 * 12. Remove postBuiltSteps (save cf templates, now handled by project type)
 * 13. Remove Github CloudFormation diff workflow (now handled by project type) 
 * 14. Add property enableCfnDiffworkflow: true
 * 15. Add property enableEmergencyProcedure: true
 * 16. Add property enableCfnLintOnGithub: true
 */

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
});

project.synth();
