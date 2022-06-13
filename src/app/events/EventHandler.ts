import {
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import * as AWS from 'aws-sdk';

export class EventHandler {

  private client: AWS.EventBridge;
  private eventBusName: string;

  constructor(eventBusName: string | undefined) {
    if (eventBusName == undefined) {
      throw 'No event bus name provided!';
    }
    this.eventBusName = eventBusName;
    this.client = new AWS.EventBridge({
      logger: console,
    });
  }

  async handleEvent(event: APIGatewayProxyEventV2) {

    console.log('Event body:', event.body);

    await this.client.putEvents({
      Entries: [
        {
          EventBusName: this.eventBusName,
          DetailType: 'BRP Notification',
          Detail: JSON.stringify({
            message: 'Test event message',
          }),
          Source: 'brp.event',
        },
      ],
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Ok',
        status: 200,
      }),
    };
  }

}
