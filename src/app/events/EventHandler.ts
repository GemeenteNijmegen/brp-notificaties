import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

export class EventHandler {

  handleEvent(event: APIGatewayProxyEventV2): APIGatewayProxyResultV2 {

    console.log('Event body:', event.body);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Ok',
      }),
    };
  }

}

