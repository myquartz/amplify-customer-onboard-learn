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

  let isCIFOperators = false;
  let isCIFAdmins = false;
  //check for admin first
  if(requester) {
      const command = new AdminListGroupsForUserCommand ({
          UserPoolId: poolId,
          Username: requester,
          Limit: 10
      });
      
      const response = await client.send(command);
      console.info("AdminListGroupsForUserCommand response", response);
      
      if(response.Groups) {
        for(let g of response.Groups) {
          const group = (g as any);
          if(group.GroupName == "CIFOperators") {
            isCIFOperators = true;
          }
          if(group.GroupName == "CIFAdmins") {
            isCIFAdmins = true;
          }
        }
      }
  }

  if(isCIFAdmins && username) {
    let userIsCIFOperators = false;
    let userIsCIFAdmins = false;
    const command = new AdminListGroupsForUserCommand ({
      UserPoolId: poolId,
      Username: requester,
      Limit: 10
    });
    
    const response = await client.send(command);
    console.info("AdminListGroupsForUserCommand username response", response);
    
    if(response.Groups) {
      for(let g of response.Groups) {
        const group = (g as any);
        if(group.GroupName == "CIFOperators") {
          userIsCIFOperators = true;
        }
        if(group.GroupName == "CIFAdmins") {
          userIsCIFAdmins = true;
        }
      }
    }
    return {
      userIsCIFAdmins: userIsCIFAdmins,
      userIsCIFOperators: userIsCIFOperators,
      requesterisCIFAdmins: isCIFAdmins,
      requesterisCIFOperators: isCIFOperators
    } as Schema["checkIfAnAdmin"]["returnType"];
  }
  
  return {
    requesterisCIFAdmins: isCIFAdmins,
    requesterisCIFOperators: isCIFOperators
  } as Schema["checkIfAnAdmin"]["returnType"];
};
