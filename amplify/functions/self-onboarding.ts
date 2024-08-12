import type { Handler } from 'aws-lambda';
import {
    AdminGetUserCommand ,
    CognitoIdentityProviderClient,
  } from "@aws-sdk/client-cognito-identity-provider";
  //import type { Schema } from "../data/resource";
  
  const client = new CognitoIdentityProviderClient({});
  
  //export const handler: Schema["selfOnboarding"]["functionHandler"] = async (event, context) => {
export const handler: Handler = async (event, context) => {
    console.info("event", event,"\ncontext",context);
    
    const { username: requester, issuer } = event?.identity as any;

    if(!requester || !issuer || !issuer.beginWith('https://cognito-idp.')) {
        return {
            error: {
                message: "not-cognito"
            }
        };
    }
    const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

    //check for admin first
    if(requester) {
        const command = new AdminGetUserCommand({
            UserPoolId: poolId,
            Username: requester
        });
        const response = await client.send(command);
        console.info("response", response);    
        return {
            customerId: requester,
            cifNumber: 0,
        }
    }

    return {
        error: {
            message: "do-nothing"
        }
    };
  };