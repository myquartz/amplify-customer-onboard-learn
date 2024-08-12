import { defineFunction } from '@aws-amplify/backend';

export const checkIfAnAdmin = defineFunction({
  name: 'checkIfAnAdmin',
  entry: './check-if-admin.ts'
});

export const selfOnboarding = defineFunction({
  name: 'selfOnboarding',
  entry: './self-onboarding.ts'
});