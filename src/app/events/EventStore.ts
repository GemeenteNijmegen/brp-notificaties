import {
    APIGatewayProxyEventV2,
} from 'aws-lambda';

export class EventStore {

    static async storeEvent(event: APIGatewayProxyEventV2, awsRequestId: string) {

        let json = JSON.stringify({
            event: event,
            id: awsRequestId,
        });

        console.log(json);


    }

}

