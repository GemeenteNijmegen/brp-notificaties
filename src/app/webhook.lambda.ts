import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { EventHandler } from './events/EventHandler';
import { EventStore } from './events/EventStore';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

let eventStore : EventStore;
let eventHandler: EventHandler;

async function init() {
  console.log('Initializing webhook lambda');
  eventStore = new EventStore(process.env.EVENT_STORE_BUCKET);
  eventHandler = new EventHandler();
  console.log('Finished initalization');
}
const initialization = init();

export const handler: ProxyHandler = async (event, context) => {

  try {

    await initialization;

    await eventStore.storeEvent(event, context.awsRequestId);
    return eventHandler.handleEvent(event);

  } catch (ex) {
    console.error(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: ex,
      }),
    };
  }

};
