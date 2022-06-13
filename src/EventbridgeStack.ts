import {
  Stack,
  StackProps,
  aws_events as eventbridge,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
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

    this.bus.archive('eventbus-archive', {
      archiveName: `${Statics.eventBusName}-archive`,
      description: 'Event bus archive for replaying brp-notification events',
      eventPattern: {}, // Is this all events?
    });


  }

}