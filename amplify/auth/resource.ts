import { defineAuth } from '@aws-amplify/backend';
import { checkIfAnAdmin } from "../functions/resource"

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
    allow.resource(checkIfAnAdmin).to(["getUser"]),
  ],
  multifactor: {
    mode: 'OPTIONAL',
    totp: true
  }
});
