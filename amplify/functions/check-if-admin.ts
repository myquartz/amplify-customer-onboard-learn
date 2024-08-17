//import type { Handler } from 'aws-lambda';
import {
  AdminListGroupsForUserCommand , AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../data/resource";
import { Tracer } from '@aws-lambda-powertools/tracer';
import type { Subsegment } from 'aws-xray-sdk-core';

const tracer = new Tracer({ serviceName: 'checkIfAdmin' });
const client = tracer.captureAWSv3Client(new CognitoIdentityProviderClient({}));

export const handler: Schema["checkIfAnAdmin"]["functionHandler"] = async (event, context) => {
  console.info("event input", event.arguments, event.request);
  const { username } = event.arguments;
  
  const { username: requester, issuer } = event?.identity as any;
  const segment = tracer.getSegment();
  let subsegment: Subsegment | undefined;
  if (segment) {
    subsegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
    tracer.setSegment(subsegment);
  }

  tracer.annotateColdStart();
  tracer.addServiceNameAnnotation();

  if(!requester || !issuer || !issuer.toString().startsWith('https://cognito-idp.')) {
    console.error("not-cognito", event.identity)
    throw "not-cognito";
  }
  const poolId = issuer.substring(issuer.lastIndexOf('/')+1);

  const finalResult: Schema["checkIfAnAdmin"]["returnType"]  = {};
  tracer.putAnnotation("requester" , requester);
  if(username)
    tracer.putAnnotation("username" , username);

  try {
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
    tracer.addResponseAsMetadata(finalResult, process.env._HANDLER);
  } catch (err) {
    // Add the error as metadata
    tracer.addErrorAsMetadata(err as Error);
    throw err;
  } finally {
    if (segment && subsegment) {
      // Close subsegment (the AWS Lambda one is closed automatically)
      subsegment.close();
      // Set back the facade segment as active again
      tracer.setSegment(segment);
    }
  }

  return finalResult;
};
