import { util } from '@aws-appsync/utils';

export function request(ctx) {
  
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({ "seqKey":"customerSEQ" }),
    update: {
        expression: 'ADD #cnt :val',
        expressionNames: { '#cnt': 'currentCifNumber' },
        expressionValues: util.dynamodb.toMapValues({ ':val': 1 }),
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