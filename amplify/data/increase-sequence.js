import { util } from '@aws-appsync/utils';
import * as ddb from '@aws-appsync/utils/dynamodb';

export function request(ctx) {
    const { seqKey, ...values } = ctx.args.input;
	values.lastCifNumber = ddb.operations.increment(1);
    values.lastUpdateTime = util.time.nowISO8601();
	const condition = { seqKey: { attributeExists: true } };
	return ddb.update({ key: { "seqKey":"customerSEQ" }, update: values, condition });
}

export function response(ctx) {
  return ctx.result
}