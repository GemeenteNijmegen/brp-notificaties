import {
  Stack,
  StackProps,
  aws_events as eventbridge,
  aws_events_targets as targets,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TestSubscriptionFunction } from './app/TestSubscription-function';
import { Statics } from './Statics';

export interface EventbridgeStackProps extends StackProps {
  branch: string;
}

/**
 * The Eventbridge Stack with eventbridge bus
 */
export class EventbridgeStack extends Stack {

  bus: eventbridge.EventBus;

  constructor(scope: Construct, id: string, props: EventbridgeStackProps) {
    super(scope, id, props);

    this.bus = new eventbridge.EventBus(this, 'eventbus', {
      eventBusName: Statics.eventBusName,
    });

    new eventbridge.Archive(this, 'eventbus-archive', {
      archiveName: `${Statics.eventBusName}-archive`,
      sourceEventBus: this.bus,
      description: 'Event bus archive for replaying brp-notification events',
      eventPattern: {
        detailType: [Statics.eventDetailType],
      },
    });

    this.addTestSubscription();

  }

  addTestSubscription() {

    const lambda = new TestSubscriptionFunction(this, 'test-subscription');

    new eventbridge.Rule(this, 'test-subscription-rule', {
      eventBus: this.bus,
      targets: [
        new targets.LambdaFunction(lambda),
      ],
      eventPattern: {
        detailType: [Statics.eventDetailType],
      },
    });


  }

}