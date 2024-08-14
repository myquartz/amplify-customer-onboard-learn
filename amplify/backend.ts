import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { checkIfAnAdmin } from './functions/resource';
import {
  CfnApp,
  CfnCampaign,
  CfnSegment,
} from "aws-cdk-lib/aws-pinpoint";
import { Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib/core";

const backend = 
defineBackend({
  auth,
  data,
  checkIfAnAdmin,
});

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