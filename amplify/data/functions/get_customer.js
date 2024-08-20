import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb'

export function request(ctx) {
    return ddb.get({ key: { customerId: ctx.args.customerId } })
}

export function response(ctx) {
    const { error, result } = ctx;
    if (error) {
        return util.appendError(error.message, error.type, result);
    }
    return result;
}