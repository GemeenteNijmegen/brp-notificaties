import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '../src/PipelineStack';

/**
 * Test if snapshot does not change. If it changes on becomes aware of
 * an change with additional affects.
 */
test('Snapshot', () => {
  const app = new App();

  // Check the pipeline.
  const pipeline = new PipelineStack(app, 'test-pipeline', {
    branchName: 'production',
    deployToEnvironment: {
      account: '1111111111',
      region: 'eu-west-1',
    },
  });
  expect(Template.fromStack(pipeline).toJSON()).toMatchSnapshot();
});