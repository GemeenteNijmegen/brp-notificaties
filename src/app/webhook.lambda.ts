import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { EventHandler } from './events/EventHandler';
import { EventStore } from './events/EventStore';

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

export const handler: ProxyHandler = async (event, context) => {

  try {

    await EventStore.storeEvent(event, context.awsRequestId);
    return EventHandler.handleEvent(event);

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
