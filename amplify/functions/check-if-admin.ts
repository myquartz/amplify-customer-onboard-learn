//import type { Handler } from 'aws-lambda';
import {
  AdminListGroupsForUserCommand ,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../data/resource";

const client = new CognitoIdentityProviderClient({});

export const handler: Schema["checkIfAnAdmin"]["functionHandler"] = async (event, context) => {
  console.info("event", event,context);
  const { username } = event.arguments;
  
  const { username: requester, issuer } = event?.identity as any;

  if(!requester || !issuer || !issuer.toString().startsWith('https://cognito-idp.')) {
      throw "not-cognito";
  }
  const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

  let finalResult = Object.create(null);
  //check for admin for requester first
  if(requester) {
      const command = new AdminListGroupsForUserCommand ({
          UserPoolId: poolId,
          Username: requester,
          Limit: 10
      });
      
      const response = await client.send(command);
      console.info("AdminListGroupsForUserCommand response", response);
      
      if(response.Groups) {
        response.Groups.reduce((a, v) => Object.defineProperty(a, "requesterIs"+v.GroupName, { value: true }), finalResult);
        console.info("finalResult requester", finalResult);
      }
  }

  if(finalResult['requesterIsCIFAdmins'] && username) {
    const command = new AdminListGroupsForUserCommand ({
      UserPoolId: poolId,
      Username: requester,
      Limit: 10
    });
    
    const response = await client.send(command);
    console.info("AdminListGroupsForUserCommand username response", response);
    
    if(response.Groups) {
      response.Groups.reduce((a, v) => Object.defineProperty(a, "userIs"+v.GroupName, { value: true }), finalResult);
      console.info("finalResult user", finalResult);
    }
  }
  
  return finalResult as Schema["checkIfAnAdmin"]["returnType"];
};
