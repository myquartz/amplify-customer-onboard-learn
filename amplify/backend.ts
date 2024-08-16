import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { checkIfAnAdmin, selfOnboarding } from './functions/resource';
import { Function } from 'aws-cdk-lib/aws-lambda';
import {
  CfnApp,
  CfnCampaign,
  CfnSegment,
} from "aws-cdk-lib/aws-pinpoint";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Table, AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Stack } from "aws-cdk-lib/core";
import * as cdk from 'aws-cdk-lib';

const backend = 
defineBackend({
  auth,
  data,
  //checkIfAnAdmin,
  selfOnboarding,
});

console.log("env", process.env);
//console.log("selfOnboarding lambda", backend.selfOnboarding.resources.lambda, backend.selfOnboarding.resources.cfnResources);

const dataResources = backend.data.resources;

if( (process.env.AWS_BRANCH??'') == "main") {
  //console.log("dataResources tables", dataResources.tables);
  Object.keys(dataResources.cfnResources.amplifyDynamoDbTables).forEach((table) => {
    console.log("DynamoDB table name", table, dataResources.cfnResources.cfnTables[table]);
    switch(table) {
      case "Customer":
        dataResources.cfnResources.amplifyDynamoDbTables[table].billingMode = BillingMode.PROVISIONED;
        dataResources.cfnResources.amplifyDynamoDbTables[table].provisionedThroughput = {
          readCapacityUnits: 3,
          writeCapacityUnits: 3,
        };
        dataResources.cfnResources.amplifyDynamoDbTables[table].setGlobalSecondaryIndexProvisionedThroughput("customersByLegalId",{
          readCapacityUnits: 3,
          writeCapacityUnits: 3,
        });
        dataResources.cfnResources.amplifyDynamoDbTables[table].setGlobalSecondaryIndexProvisionedThroughput("customersByCifNumber",{
          readCapacityUnits: 1,
          writeCapacityUnits: 1,
        });
        dataResources.cfnResources.amplifyDynamoDbTables[table].setGlobalSecondaryIndexProvisionedThroughput("customersByPhoneNumber",{
          readCapacityUnits: 1,
          writeCapacityUnits: 1,
        });
        break;
      /*
      case "CustomerIdCards":
      case "CustomerContacts":
        dataResources.cfnResources.amplifyDynamoDbTables[table].billingMode = BillingMode.PROVISIONED;
      case "customerIdCardsByIdNumber":
      case "customerContactsByContactPhone":
        dataResources.cfnResources.amplifyDynamoDbTables[table].provisionedThroughput = {
          readCapacityUnits: 1,
          writeCapacityUnits: 1,
        };
        break;*/
      default:
        break;
    }
  });
}

const externalDataSourcesStack = backend.createStack("appExternalDS");

const externalCIFSequenceTable = new Table(
  externalDataSourcesStack,
  "CIFSequence",
  {
    partitionKey: { "name": "seqKey", "type": AttributeType.STRING },
    billingMode: BillingMode.PAY_PER_REQUEST,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  }
);


backend.data.addDynamoDbDataSource(
  "extCIFSequenceDS",
  externalCIFSequenceTable
);

//const checkIfAnAdminLambda = backend.checkIfAnAdmin;
//checkIfAnAdminLambda.addEnvironment("CUSTOMER_TABLE", dataResources.tables["Customer"].tableName);
///checkIfAnAdminLambda.resources.cfnResources.cfnFunction.functionName = "checkIfAnAdmin";
//const CIFSequence = backend.data.resources.tables.CIFSequence as Table;
//const Customer = backend.data.resources.tables.Customer as Table;
//const CustomerContacts = backend.data.resources.tables.CustomerContacts as Table;
//const selfOnboardingLambda = backend.selfOnboarding//.resources.lambda as Function;
//selfOnboardingLambda.addEnvironment("CIFSEQUENCE_TABLE", externalCIFSequenceTable.tableName)

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
/*const { cfnIdentityPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = true;*/

const inAppMessagingStack = backend.createStack("inAppMessaging-stack");

// create a Pinpoint app
const pinpoint = new CfnApp(inAppMessagingStack, "Pinpoint", {
  name: "onboardPinpointApp",
});

// create a segment 
const mySegment = new CfnSegment(inAppMessagingStack, "Segment", {
  applicationId: pinpoint.ref,
  name: "defaultSegment",
});

// create a campaign with event and in-app message template
new CfnCampaign(inAppMessagingStack, "Campaign", {
  applicationId: pinpoint.ref,
  name: "onboardCampaign",
  segmentId: mySegment.attrSegmentId,
  schedule: {
    // ensure the start and end time are in the future
    startTime: (new Date(Date.now()+5*60*1000)).toISOString(), 
    endTime: (new Date(Date.now()+7*86400*1000)).toISOString(),
    frequency: "IN_APP_EVENT",
    eventFilter: {
      dimensions: {
        eventType: {
          dimensionType: "INCLUSIVE",
          values: ["my_first_event"],
        },
      },
      filterType: "ENDPOINT",
    },
  },

  messageConfiguration: {
    inAppMessage: {
      layout: "TOP_BANNER",
      content: [
        {
          // define the content of the in-app message
          bodyConfig: {
            alignment: "CENTER",
            body: "Welcome to demostration of Onboard. Chào mừng đến với ứng dụng Customer Onboard.",
            textColor: "#FFFFFF",
          },
          backgroundColor: "#000000",
          headerConfig: {
            alignment: "CENTER",
            header: "Xin chào - Welcome!",
            textColor: "#FFFFFF",
          },
          // optionally, define buttons, images, etc.
        },
      ],
    },
  },
});

//create an IAM policy to allow interacting with Pinpoint in-app messaging
const pinpointPolicy = new Policy(inAppMessagingStack, "PinpointPolicy", {
  policyName: "PinpointPolicy",
  statements: [
    new PolicyStatement({
      actions: [
        "mobiletargeting:GetInAppMessages",
        "mobiletargeting:UpdateEndpoint",
        "mobiletargeting:PutEvents",
      ],
      resources: [pinpoint.attrArn + "/*", pinpoint.attrArn],
    }),
  ],
});

// apply the policy to the authenticated and unauthenticated roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(pinpointPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(pinpointPolicy);

// patch the custom Pinpoint resource to the expected output configuration
backend.addOutput({
  analytics: {
    amazon_pinpoint: {
      app_id: pinpoint.ref,
      aws_region: Stack.of(pinpoint).region,
    }
  },
  notifications: {
    amazon_pinpoint_app_id: pinpoint.ref,
    aws_region: Stack.of(pinpoint).region,
    channels: ["IN_APP_MESSAGING"],
  },
});
