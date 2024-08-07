import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ seqKey: "customerSeq"}),
    update: {
      expression: 'SET #cnt = #cnt + :val, #time = :now',
      expressionAttributeNames: {'#cnt': 'lastCifNumber','#time':'lastUpdateTime'},
      expressionValues: { ':val': 1, ':now': (new Date()).toUTCString() },
      returnValues: "UPDATED_NEW"
    }
  }
}

export function response(ctx) {
  return ctx.result
}