import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { selfOnboarding } from './functions/resource';
//import * as iam from "aws-cdk-lib/aws-iam"
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Table } from 'aws-cdk-lib/aws-dynamodb';

const backend = 
defineBackend({
  auth,
  data,
  //checkIfAnAdmin,
  selfOnboarding,
});


//const CIFSequence = backend.data.resources.tables.CIFSequence as Table;
//const Customer = backend.data.resources.tables.Customer as Table;
//const CustomerContacts = backend.data.resources.tables.CustomerContacts as Table;
//const selfOnboardingLambda = backend.selfOnboarding.resources.lambda as Function;

/*
const statement = new iam.PolicyStatement({
  sid: "AllowFullReadWrite",
  actions: ["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem",],
  effect: iam.Effect.ALLOW,
  resources: [CIFSequence.tableArn, Customer.tableArn, CustomerContacts.tableArn],
})

selfOnboardingLambda.addToRolePolicy(statement)*/

//CIFSequence.grantReadWriteData(selfOnboardingLambda)
//Customer.grantReadWriteData(selfOnboardingLambda)
//CustomerContacts.grantReadWriteData(selfOnboardingLambda)
//selfOnboardingLambda.addEnvironment("CIF_SEQUENCE_TABLE", CIFSequence.tableName)
//selfOnboardingLambda.addEnvironment("CUSTOMTER_TABLE", Customer.tableName)
//selfOnboardingLambda.addEnvironment("CUSTOMTER_CONTACTS_TABLE", CustomerContacts.tableName)

//cfnIdentityPool.allowUnauthenticatedIdentities = true;