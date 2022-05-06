import {
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import * as AWS from 'aws-sdk';

export class EventStore {

  static async storeEvent(event: APIGatewayProxyEventV2, awsRequestId: string) {

    const s3 = new AWS.S3();

    let json = JSON.stringify({
      event: event,
      id: awsRequestId,
    });

    if ( process.env.EVENT_STORE_ARN == undefined ) {
      throw 'No bucket found!';
    }

    s3.putObject({
      Bucket: process.env.EVENT_STORE_ARN,
      Key: awsRequestId,
      Body: json,
    }, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Data saved? ", data);
      }
    }).send();

    console.log('Data should be saved', json);

  }

}

