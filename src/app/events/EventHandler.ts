import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
} from 'aws-lambda';

export class EventHandler {

    static handleEvent(event: APIGatewayProxyEventV2): APIGatewayProxyResultV2 {

        var body = JSON.stringify({
            message: 'Ok',
        });

        if (event.body != undefined) {
            body = event.body;
        }

        return {
            statusCode: 200,
            body
        };
    }

}

