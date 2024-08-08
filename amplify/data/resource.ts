import { type ClientSchema, a, defineData,  } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({

  CIFSequence: a
    .model({
      seqKey: a.string().required(),
      lastCifNumber: a.integer().required()
    })
    .identifier(["seqKey"])
    .authorization(allow => [allow.authenticated().to(['read']), allow.group('CIFOperators')]),
  
    /*nextCIFSequence: a
    .mutation().returns(a.ref("CIFSequence"))
    .handler(a.handler.custom({
      dataSource: a.ref("CIFSequence"),
      entry: './increase-sequence.js'
    }))
    .authorization(allow => [allow.authenticated()]), */
  
  Customer: a
    .model({
      customerId: a.id().required(),
      customerName: a.string().required(),
      cifNumber: a.integer(),
      phoneNumber: a.phone(),
      legalId: a.string(),
      isDeleted: a.boolean(),
      idcards: a.hasMany('CustomerIdCards', 'customerId'),
      contacts: a.hasMany('CustomerContacts', 'contactId'),
      owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')])
    })
    .identifier(["customerId"])
    .secondaryIndexes((index) => [index("cifNumber"), index("phoneNumber")])
    .authorization((allow) => [allow.owner(), allow.group('CIFOperators')]),

  CustomerIdCards: a
    .model({
      idCardId: a.id().required(),
      idNumber: a.string().required(),
      nameOnCard: a.string().required(),
      familyName: a.string(),
      surName: a.string(),
      midName: a.string(),
      dateOfBirth: a.date().required(),
      nationalityCode: a.string().required(),
      issueDate: a.date().required(),
      expireDate: a.date(),
      expiredOrInvalidState: a.boolean(),
      otherIdData: a.json(),
      idCardsOwner: a.belongsTo("Customer","customerId"),
      updatedBy: a.string()
    })
    .identifier(["idCardId","idNumber"])
    .secondaryIndexes((index) => [
      index("idNumber").sortKeys(["dateOfBirth"]),
      index("nameOnCard").queryField("searchByName")
    ])
    .authorization((allow) => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')]),

  CustomerContacts: a
    .model({
      contactId: a.id().required(),
      contactScope: a.enum(["primary","secondary","refer","other"]),
      contactType: a.enum(["phone","email","instant_messenger","other"]),
      contactPhone: a.phone(),
      contactEmail: a.email(),
      contactReferenceKey: a.string().authorization((allow) => [allow.owner().to(['read']), allow.group('CIFOperators')]),
      contactOwner: a.belongsTo("Customer","customerId").authorization((allow) => [allow.owner().to(['read']), allow.group('CIFOperators')]),
      updatedBy: a.string()
    })
    .identifier(["contactId"])
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
