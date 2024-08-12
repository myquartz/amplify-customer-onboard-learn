import { defineAuth } from '@aws-amplify/backend';
import { checkIfAnAdmin, selfOnboarding } from "../functions/resource"

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ["CIFAdmins","CIFOperators"],
  access: (allow) => [
    allow.resource(checkIfAnAdmin).to(["getUser","listGroupsForUser","listUsersInGroup"]),
    allow.resource(selfOnboarding).to(["getUser"]),
  ],
  multifactor: {
    mode: 'OPTIONAL',
    totp: true
  }
});
