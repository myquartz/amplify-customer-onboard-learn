import { util } from '@aws-appsync/utils';

export function request(ctx) {
  
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ "seqKey":"customerSEQ" }),
    update: {
        expression: 'SET #cnt = #cnt + :val, #id = :genId, #ua = :nowTime',
        expressionNames: { '#cnt': 'currentCifNumber', '#id':'currentCustomerId', '#ua': 'updatedAt' },
        expressionValues: util.dynamodb.toMapValues({ ':val': 1, ':genId': util.autoUlid(), ':nowTime': util.time.nowISO8601() }),
    },
  };
}

export function response(ctx) {
      const { error, result } = ctx;
    if (error) {
        return util.appendError(error.message, error.type, result);
    }
    return result;
}