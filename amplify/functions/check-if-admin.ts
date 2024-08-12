//import type { Handler } from 'aws-lambda';
import {
  AdminListGroupsForUserCommand ,
  AdminGetUserCommand, 
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../data/resource";

const client = new CognitoIdentityProviderClient({});

export const handler: Schema["checkIfAnAdmin"]["functionHandler"] = async (event, context) => {
  console.info("event", event,context);
  const { username } = event.arguments;
  
  const { username: requester, issuer } = event?.identity as any;

  if(!requester || !issuer || !issuer.beginWith('https://cognito-idp.')) {
      return "not-cognito";
  }
  const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

  //check for admin first
  if(requester) {
      const command = new AdminListGroupsForUserCommand ({
          UserPoolId: poolId,
          Username: requester,
          Limit: 10
      });
      const response = await client.send(command);
      console.info("AdminListGroupsForUserCommand response", response);    
  }

  if(username) {
    const command = new AdminGetUserCommand({
      UserPoolId: 'ap-southeast-1_wKzoM1p4P',
      Username: username
    });
    const response = await client.send(command);
    console.info("AdminGetUserCommand response", response);
  }
  // your function code goes here
  return 'not-an-admin';
};