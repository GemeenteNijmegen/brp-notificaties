import {
  EventBridgeHandler
} from 'aws-lambda';

interface BrpEvent {
  timestamp?: string;
  bsn?: string;
}

interface BrpEventResponse {
  status: number;
}

type BrpEventSubscription = EventBridgeHandler<'BRP Notification', BrpEvent, BrpEventResponse>;

export const handler: BrpEventSubscription = async (event) => {

  try {

    console.log(event);
    console.log(event.detail);

    return {
      status: 200,
    }

  } catch (ex) {

    console.error(ex);

    return {
      status: 500,
    }
  }

};
