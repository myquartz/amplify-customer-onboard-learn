//import type { Handler } from 'aws-lambda';
import {
    AdminGetUserCommand ,
    CognitoIdentityProviderClient,
  } from "@aws-sdk/client-cognito-identity-provider";

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../data/resource';
import { env } from '$amplify/env/selfOnboarding';
import { Tracer } from '@aws-lambda-powertools/tracer';
import type { Subsegment } from 'aws-xray-sdk-core';

Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT, // replace with your defineData name
          region: env.AWS_REGION,
          defaultAuthMode: 'identityPool'
        }
      }
    },
    {
      Auth: {
        credentialsProvider: {
          getCredentialsAndIdentityId: async () => ({
            credentials: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              sessionToken: env.AWS_SESSION_TOKEN,
            },
          }),
          clearCredentialsAndIdentityId: () => {
            /* noop */
          },
        },
      },
    }
);
  
const tracer = new Tracer({ serviceName: 'selfOnboarding' });
const dataClient = generateClient<Schema>();
const cogClient = tracer.captureAWSv3Client(new CognitoIdentityProviderClient({}));
const dynClient = tracer.captureAWSv3Client(new DynamoDBClient({}));
  
export const handler: Schema["selfOnboarding"]["functionHandler"] = async (event, context) => {
//export const handler: Handler = async (event, context) => {
    console.info("event", event,"\ncontext",context);
    
    const { username: requester, issuer } = event?.identity as any;

    const segment = tracer.getSegment();
  let subsegment: Subsegment | undefined;
  if (segment) {
    subsegment = segment.addNewSubsegment(`## ${process.env._HANDLER}`);
    tracer.setSegment(subsegment);
  }

  tracer.annotateColdStart();
  tracer.addServiceNameAnnotation();

    if(!requester || !issuer || !issuer.startsWith('https://cognito-idp.')) {
        throw "not-cognito";
    }
    const poolId = issuer.substring(issuer.lastIndexOf('/')+1);
  tracer.putAnnotation("requester" , requester);
  
  try {
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
        const dbSeqCommand = new UpdateItemCommand({
            TableName: process.env.CIFSEQUENCE_TABLE,
            Key: { "seqKey":{ "S": "customerSEQ" }},
            ReturnValues: "ALL_NEW",
            UpdateExpression: 'ADD #cnt :val SET #id = :genId, #ua = :nowTime',
            ExpressionAttributeNames: { '#cnt': 'currentCifNumber', '#id':'currentCustomerId', '#ua': 'updatedAt' },
            ExpressionAttributeValues: { ':val': { "N": "1" }, ':genId': { "S": cogResponse.Username??'' }, 
                ':nowTime': { "S":(new Date()).toISOString() } },
        });
        const { Attributes: dbSeqAttributes, ConsumedCapacity: dbSeqConsumedCapacity } = await dynClient.send(dbSeqCommand);
        console.info("dbSeqAttributes", dbSeqAttributes, "dbSeqConsumedCapacity", dbSeqConsumedCapacity);

        if(!dbSeqAttributes) {
            throw "can-not-go-next-sequence";
        }

        const currentCifNumber = parseInt(dbSeqAttributes["currentCifNumber"].N ?? '0');
        const currentCustomerId = dbSeqAttributes["currentCustomerId"].S ?? requester;

        if(currentCifNumber > 0) {
            //create customer by graphQL
            const createCustomer = `mutation MyMutation(
            $cifNumber: Int, 
            $customerId: ID!,
            $customerName: String!, 
            $dateOfBirth: AWSDate!, 
            $gender: GenderType!, 
            $legalId: String!, 
            $owner: String!, 
            $phoneNumber: AWSPhone!, 
            $updatedBy: String = "self-onboarding") {
    createCustomer(
        input: {customerId: $customerId, customerName: $customerName, dateOfBirth: $dateOfBirth, gender: $gender, 
            legalId: $legalId, owner: $owner, phoneNumber: $phoneNumber, updatedBy: $updatedBy, cifNumber: $cifNumber}
    ) {
        createdAt
        cifNumber
    }
    }`;
            const { customerName,
                dateOfBirth, 
                gender, 
                legalId, 
                phoneNumber, } = event.arguments;
            const input = {
                    cifNumber: currentCifNumber, 
                    customerId: currentCustomerId,
                    customerName,
                    dateOfBirth, 
                    gender, 
                    legalId, 
                    phoneNumber,
                    owner: requester, 
                };
            tracer.putAnnotation("legalId" , legalId??'');
            tracer.putAnnotation("phoneNumber" , phoneNumber??'');
            console.log("createCustomer variables:",input);
            let subsegment2: Subsegment | undefined;
            if (segment) {
              if(subsegment)
                subsegment2 = subsegment.addNewSubsegment(`## createCustomer graphql`);
              else
                subsegment2 = segment.addNewSubsegment(`## createCustomer graphql`);
              tracer.setSegment(subsegment2);
            }
            try {
                const createCustomerResponse = await dataClient.graphql({
                    query: createCustomer,
                    variables: {
                        ...input
                    },
                    //authMode: 'iam'
                })
                console.info("createCustomerResponse", createCustomerResponse);
                tracer.putMetadata("createCustomerResponse",createCustomerResponse);
            }
            catch (e) {
                console.error("createCustomer error", e);
                tracer.addErrorAsMetadata(e as Error);
                throw JSON.stringify(e);
            }
            finally {
              if (subsegment && subsegment2) {
                subsegment2.close();
                tracer.setSegment(subsegment);
              }
              else if(segment)
                tracer.setSegment(segment);
            }
        }
        tracer.addResponseAsMetadata(dbSeqAttributes, process.env._HANDLER);
        return {
          customerId: dbSeqAttributes ? dbSeqAttributes["currentCustomerId"].S : cogResponse.Username,
          cifNumber: dbSeqAttributes ? dbSeqAttributes["currentCifNumber"].N : 0,
        } as Schema["selfOnboarding"]["returnType"];  
    }
  } catch (err) {
    // Add the error as metadata
    tracer.addErrorAsMetadata(err as Error);
    throw err;
  } finally {
    if (segment && subsegment) {
      // Close subsegment (the AWS Lambda one is closed automatically)
      if(subsegment)
        subsegment.close();
      // Set back the facade segment as active again
      tracer.setSegment(segment);
    }
  }  
    throw "do-nothing";
  };