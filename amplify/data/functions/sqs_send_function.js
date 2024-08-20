import { util } from '@aws-appsync/utils';

export function request(ctx) {
  
    return {
		version: '2018-05-29',
		method: 'POST',
		params: {
			headers: {
				'Content-Type': 'application/x-amz-json-1.0',
				'X-Amz-Target': 'AmazonSQS.SendMessage'
			},
			"body": {
    "QueueUrl": "https://sqs.ap-southeast-1.amazonaws.com/722273251097/EmailSendingQueue",
    "MessageBody": JSON.stringify(ctx.prev.result),
    "MessageAttributes": {
        "identity": {
            "DataType": "String",
            "StringValue": JSON.stringify(ctx.identity)
        },
        "request": {
            "DataType": "String",
            "StringValue": JSON.stringify(ctx.request)
        }
    }
}
		},
		resourcePath: '/',
	}
}

export function response(ctx) {
    const { error, result } = ctx;
    if (error) {
        return util.appendError(error.message, error.type, result);
    }
    if (ctx.result.statusCode == 200) {
		return JSON.parse(ctx.result.body);
    } else {
        return util.appendError(ctx.result.body, "ctx.result.statusCode")
    }
}