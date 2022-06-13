import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { EventHandler } from './events/EventHandler';
import { EventStore } from './events/EventStore';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

let eventHandler: EventHandler;
let eventStore: EventStore;

async function init() {
  console.info('Initializing webhook lambda');
  eventStore = new EventStore(process.env.EVENT_STORE_BUCKET);
  eventHandler = new EventHandler(process.env.EVENT_BUS_NAME);

  console.info('Finished initalization of webhook lambda');
}
const initialization = init();

export const handler: ProxyHandler = async (event, context) => {
  try {

    await initialization;
    return await eventHandler.handleEvent(event);

  } catch (ex) {
    console.error(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error on handling the event',
      }),
    };
  }

};
