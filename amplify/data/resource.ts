import { type ClientSchema, a, defineData  } from "@aws-amplify/backend";

import { checkIfAnAdmin, selfOnboarding  } from "../functions/resource"

const schema = a.schema({
  checkIfAnAdminReturnType: a
    .customType({
      requesterUsername: a.string(),
      requesterFullName: a.string(),
      requesterCustomerId: a.string(),
      usernameIsCIFAdmins: a.boolean(),
      usernameIsCIFOperators: a.boolean(),
      requesterIsCIFAdmins: a.boolean(),
      requesterIsCIFOperators: a.boolean(),
    }),

  checkIfAnAdmin: a
    .query()
    .arguments({
      username: a.string(),
    })
    .returns(a.ref('checkIfAnAdminReturnType'))
    .handler(a.handler.function(checkIfAnAdmin))
    .authorization(allow => [allow.authenticated(), allow.guest()]),

  selfOnboardingReturnType: a
    .customType({
      customerId: a.id(),
      cifNumber: a.integer(),
    }),
  selfOnboarding: a
    .mutation()
    .arguments({
      customerName: a.string().required(),
      dateOfBirth: a.date().required(),
      gender: a.enum(['male','female','undisclosed']),
      phoneNumber: a.phone(),
      legalId: a.string(),
    })
    .returns(a.ref('selfOnboardingReturnType'))
    .handler(a.handler.function(selfOnboarding))
    .authorization(allow => [ allow.authenticated()]),

  sqsSendMessageResponseType: a
    .customType({
      customerId: a.id(),
      cifNumber: a.integer(),
    }),
    
  CIFSequence: a
    .customType({
      seqKey: a.string().required(),
      currentCifNumber: a.integer().required(),
      currentCustomerId: a.id()
    }),
  
  nextCIFSequence: a
    .mutation().returns(a.ref("CIFSequence"))
    .handler(a.handler.custom({
      dataSource: 'extCIFSequenceDS',
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
      updatedBy: a.string(),
      owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')])
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
      updatedBy: a.string(),
      owner: a.string().authorization(allow => [allow.owner().to(['read', 'delete']), allow.group('CIFOperators')])
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
}).authorization((allow) => [allow.resource(selfOnboarding)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    //defaultAuthorizationMode: 'userPool', //identityPool, userPool, apiKey
    defaultAuthorizationMode: 'iam',
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    }
  },
});
