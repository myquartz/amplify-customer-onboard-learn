import { defineFunction } from '@aws-amplify/backend';

export const checkIfAnAdmin = defineFunction({
  name: 'checkIfAnAdmin',
  timeoutSeconds: 8,
  entry: './check-if-admin.ts'
});

export const selfOnboarding = defineFunction({
  name: 'selfOnboarding',
  entry: './self-onboarding.ts',
  timeoutSeconds: 15,
  environment: {
    EXTERNAL_API_ENDPOINT: "to-be-fulfill"
  },
});