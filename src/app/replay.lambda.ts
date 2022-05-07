import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { EventStore } from './events/EventStore';

var eventStore: EventStore;

async function init() {
  console.log('Initializing replay lambda');
  eventStore = new EventStore(process.env.EVENT_STORE_BUCKET);
}
const initialization = init();

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {

  try {

    await initialization;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'ok',
      }),
    };

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
