import { util } from '@aws-appsync/utils';

export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ seqKey: "customerSeq"}),
    update: {
      expression: 'SET #cnt = #cnt + :val, #time = :now',
      expressionNames: {'#cnt': 'lastCifNumber','#time':'lastUpdateTime'},
      expressionValues: { ':val': { 
            "N": "1"
        }, ':now': {
            "S": util.time.nowISO8601()
        } },
      returnValues: "UPDATED_NEW"
    }
  }
}

export function response(ctx) {
  return ctx.result
}