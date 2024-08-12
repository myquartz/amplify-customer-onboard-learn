import type { Handler } from 'aws-lambda';
import {
  AdminGetUserCommand ,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Schema } from "../data/resource";

const client = new CognitoIdentityProviderClient({});

export const handler: Schema["checkIfAnAdmin"]["functionHandler"] = async (event, context) => {
  console.info("event", event,context);
  const { username } = event.arguments;

  if(username) {
    const command = new AdminGetUserCommand({
      UserPoolId: 'ap-southeast-1_wKzoM1p4P',
      Username: username
    });
    const response = await client.send(command);
    console.info("response", response);
  }
  // your function code goes here
  return 'not-an-admin';
};