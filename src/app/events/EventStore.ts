import {
  APIGatewayProxyEventV2,
} from 'aws-lambda';
import * as AWS from 'aws-sdk';

export class EventStore {

  bucket: string;
  s3: AWS.S3;

  constructor(bucketName: string | undefined) {
    if (bucketName == undefined) {
      throw 'No bucket name provided!';
    }
    this.bucket = bucketName;

    this.s3 = new AWS.S3();
  }

  async storeEvent(event: APIGatewayProxyEventV2, awsRequestId: string) {

    let json = JSON.stringify({
      event: event,
      id: awsRequestId,
    });

    await this.s3.putObject({
      Bucket: this.bucket,
      Key: awsRequestId,
      Body: json,
    }).promise();

    console.log('End of lambda', json, process.env.EVENT_STORE_ARN);

  }

  async listEvents(from: string | undefined) {

    const events = await this.s3.listObjects({
      Bucket: this.bucket,
      Marker: from,
    }).promise();

    return events;

  }

}

