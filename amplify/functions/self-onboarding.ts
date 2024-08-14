import type { Handler } from 'aws-lambda';
import {
    AdminGetUserCommand ,
    CognitoIdentityProviderClient,
  } from "@aws-sdk/client-cognito-identity-provider";

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Schema } from '../data/resource';
  //import type { Schema } from "../data/resource";
  
  const cogClient = new CognitoIdentityProviderClient({});
//  const dynClient = new DynamoDBClient({});
  
//export const handler: Schema["selfOnboarding"]["functionHandler"] = async (event, context) => {
export const handler: Handler = async (event, context) => {
    console.info("event", event,"\ncontext",context);
    
    const { username: requester, issuer } = event?.identity as any;

    if(!requester || !issuer || !issuer.startsWith('https://cognito-idp.')) {
        throw "not-cognito";
    }
    const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

    //get user information
    if(requester) {
        const cogCommand = new AdminGetUserCommand({
            UserPoolId: poolId,
            Username: requester
        });
        const cogResponse = await cogClient.send(cogCommand);
        console.info("response", cogResponse);
        //check for existing

        //next seq
        const dbCommand = new UpdateItemCommand({
            TableName: "",
            Key: { "seqKey":{ "S": "customerSEQ" }},
            ReturnValues: "ALL_NEW",
            UpdateExpression: 'SET #cnt = #cnt + :val, #id = :genId, #ua = :nowTime',
            ExpressionAttributeNames: { '#cnt': 'currentCifNumber', '#id':'currentCustomerId', '#ua': 'updatedAt' },
            ExpressionAttributeValues: { ':val': { "N": "1" }, ':genId': { "S": cogResponse.Username??'' }, 
                ':nowTime': { "S":(new Date()).toISOString() } },
        });

        return {
            customerId: requester,
            cifNumber: 0,
        } //as Schema["selfOnboarding"]["returnType"];
    }

    throw "do-nothing";
  };