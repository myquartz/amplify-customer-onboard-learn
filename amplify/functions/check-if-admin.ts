//import type { Handler } from 'aws-lambda';
import {
  AdminListGroupsForUserCommand , AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../data/resource";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new CognitoIdentityProviderClient({});
const dynClient = new DynamoDBClient({});

export const handler: Schema["checkIfAnAdmin"]["functionHandler"] = async (event, context) => {
  console.info("event", event,context, process.env);
  const { username } = event.arguments;
  
  const { username: requester, issuer } = event?.identity as any;

  if(!requester || !issuer || !issuer.toString().startsWith('https://cognito-idp.')) {
      throw "not-cognito";
  }
  const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

  const finalResult: Schema["checkIfAnAdmin"]["returnType"]  = {};
  //check for admin for requester first
  if(requester) {
      const userGetCommand = new AdminGetUserCommand ({
          UserPoolId: poolId,
          Username: requester
      });
      const userGetResponse = await client.send(userGetCommand);
      console.info("userGetCommand response", userGetResponse);

      finalResult.requesterUsername = userGetResponse.Username;
      if(userGetResponse.UserAttributes)
        finalResult.requesterFullName = userGetResponse.UserAttributes.find(u => u.Name == 'name')?.Value??'';

      if(finalResult.requesterUsername) {
        //get customer Id
        
      }

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
