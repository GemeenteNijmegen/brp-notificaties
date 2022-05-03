import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../src/PipelineStack';
import { Statics } from '../src/Statics';

/**
 * Test if snapshot does not change. If it changes on becomes aware of a change
 * due to failing tests.
 */
test('Snapshot', () => {
  const app = new App();

  // Check the pipeline.
  const pipeline = new PipelineStack(app, 'test-pipeline', {
    env: {
      account: '2222222222',
      region: 'eu-west-1',
    },
    branchName: 'production',
    deployToEnvironment: {
      account: '1111111111',
      region: 'eu-west-1',
    },
  });
  expect(Template.fromStack(pipeline).toJSON()).toMatchSnapshot();
});


/**
 * Test static functions
 */
test('Statics', () => {
  // Dev
  expect(Statics.isDevelopment(process.env.NON_EXISTENT_VARIABLE_NAME)).toBe(true);
  expect(Statics.isDevelopment('feat/some-branch-name')).toBe(true);
  // Accp
  expect(Statics.isAcceptance(process.env.NON_EXISTENT_VARIABLE_NAME)).toBe(false);
  expect(Statics.isAcceptance('feat/some-branch-name')).toBe(false);
  expect(Statics.isAcceptance('production')).toBe(false);
  expect(Statics.isAcceptance('acceptance')).toBe(true);
  // Prod
  expect(Statics.isProduction(process.env.NON_EXISTENT_VARIABLE_NAME)).toBe(false);
  expect(Statics.isProduction('feat/some-branch-name')).toBe(false);
  expect(Statics.isProduction('acceptance')).toBe(false);
  expect(Statics.isProduction('production')).toBe(true);
});