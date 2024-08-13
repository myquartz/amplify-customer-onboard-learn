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

  const finalResult: Schema["checkIfAnAdmin"]["returnType"]  = {};
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
        response.Groups.forEach((v) => {
          if(v.GroupName == "CIFAdmins")
            finalResult.requesterIsCIFAdmins = true ;
          else if(v.GroupName == "CIFOperators")
            finalResult.requesterIsCIFOperators = true ;
          else
            console.warn("Not valid group name",v.GroupName);
        });
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
      response.Groups.forEach((v) => {
        if(v.GroupName == "CIFAdmins")
          finalResult.usernameIsCIFAdmins = true ;
        else if(v.GroupName == "CIFOperators")
          finalResult.usernameIsCIFOperators = true ;
        else
          console.warn("Not valid group name",v.GroupName);
      });
      console.info("finalResult user", finalResult);
    }
  }
  
  return finalResult;
};
