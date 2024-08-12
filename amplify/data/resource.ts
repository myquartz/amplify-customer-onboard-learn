import { type ClientSchema, a, defineData,  } from "@aws-amplify/backend";

import { checkIfAnAdmin } from "../functions/resource"

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  checkIfAnAdmin: a
    .query()
    .arguments({
      username: a.string(),
    })
    .returns({
      usernameIsCIFAdmins: a.boolean(),
      usernameIsCIFOperators: a.boolean(),
      requesterIsCIFAdmins: a.boolean(),
      requesterIsCIFOperators: a.boolean(),
    })
    .handler(a.handler.function(checkIfAnAdmin))
    .authorization(allow => [allow.publicApiKey(), allow.authenticated()]),

  /*selfOnboarding: a
    .mutation()
    .arguments({
      customerName: a.string().required(),
      dateOfBirth: a.date().required(),
      gender: a.enum(['male','female','undisclosed']),
      cifNumber: a.integer(),
      phoneNumber: a.phone(),
    })
    .returns({
      error: a.customType({
        message: a.string()
      }),
      customerId: a.id(),
      cifNumber: a.integer(),
    })
    .handler(a.handler.function(selfOnboarding))
    .authorization(allow => [ allow.authenticated()]),*/

  CIFSequence: a
    .model({
      seqKey: a.string().required(),
      currentCifNumber: a.integer().required(),
      currentCustomerId: a.id()
    })
    .identifier(["seqKey"])
    .authorization(allow => [allow.publicApiKey(), allow.authenticated().to(['read']), allow.group('CIFOperators')]),
  
    nextCIFSequence: a
    .mutation().returns(a.ref("CIFSequence"))
    .handler(a.handler.custom({
      dataSource: a.ref("CIFSequence"),
      entry: './increase-sequence.js'
    }))
    .authorization(allow => [allow.authenticated()]),
  
  GenderType: a.enum(['male','female','undisclosed']),
  IdCardDataType: a
    .customType({
      idCardType: a.enum(['NID','CITIZEN','RESIDENCE','PASSPORT','OTHER']),
      idNumber: a.string().required(),
      nameOnCard: a.string().required(),
      familyName: a.string(),
      surName: a.string(),
      midName: a.string(),
      dateOfBirth: a.date().required(),
      gender: a.ref('GenderType'),
      nationalityCode: a.string().required(),
      issueDate: a.date().required(),
      issueBy: a.string(),
      expireDate: a.date(),
      expiredOrInvalidState: a.boolean(),
      idCardVerificationKey: a.string(),
      otherIdData: a.json(),
    }),
  
  Customer: a
    .model({
      customerId: a.id().required(),
      customerName: a.string().required(),
      dateOfBirth: a.date().required(),
      gender: a.ref('GenderType'),
      cifNumber: a.integer(),
      phoneNumber: a.phone(),
      legalId: a.string(),
      legalIdCardData: a.ref('IdCardDataType'),
      isDeleted: a.boolean(),
      storedIdCards: a.hasMany('CustomerIdCards', 'ownCustomerId'),
      contacts: a.hasMany('CustomerContacts', 'ownCustomerId'),
      updatedBy: a.string()
    })
    .identifier(["customerId"])
    .secondaryIndexes((index) => [index("cifNumber"), index("phoneNumber"), index("legalId")])
    .authorization((allow) => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')]),

  CustomerIdCards: a
    .model({
      ownCustomerId: a.id().required(),
      cardIndex: a.integer().required(),
      idNumber: a.string().required(),
      cardData: a.ref('IdCardDataType'),
      ownCustomer: a.belongsTo("Customer","ownCustomerId"),
      updatedBy: a.string()
    })
    .identifier(["ownCustomerId", "cardIndex"])
    .secondaryIndexes((index) => [
      index("idNumber").queryField("searchByIdNumber")
    ])
    .authorization((allow) => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')]),

  CustomerContacts: a
    .model({
      ownCustomerId: a.id().required(),
      contactIndex: a.integer().required(),
      contactScope: a.enum(["primary","secondary","refer","other"]),
      contactCapabilities: a.string().array(), //one of ["phone","sms","instant_message"]
      contactPhone: a.phone(),
      contactEmail: a.email(),
      contactVerified: a.boolean().authorization((allow) => [allow.owner().to(['read','delete']), allow.group('CIFOperators')]),
      contactVerificationKey: a.string().authorization((allow) => [allow.owner().to(['read']), allow.group('CIFOperators')]),
      ownCustomer: a.belongsTo("Customer","ownCustomerId"),
      updatedBy: a.string(),
      owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')])
    })
    .identifier(["ownCustomerId", "contactIndex"])
    .secondaryIndexes((index) => [
      index("contactPhone"),
      index("contactEmail")
    ])
    .authorization((allow) => [allow.owner(), allow.group('CIFOperators')]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', //identityPool, userPool, apiKey
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
