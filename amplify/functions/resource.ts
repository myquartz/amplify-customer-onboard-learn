import { defineFunction } from '@aws-amplify/backend';

export const checkIfAnAdmin = defineFunction({
  name: 'checkIfAnAdmin',
  entry: './check-if-admin.ts'
});

export const selfOnboarding = defineFunction({
  name: 'selfOnboarding',
  entry: './self-onboarding.ts',
  environment: {
    NAME: "World",
    CIFSEQUENCE_TABLE: "amplify-d2d0afan41yjqi-main-branch-122d556230-appExternalDS511606E4-K3FKGV4D8C4Y-CIFSequence70BF13F6-1QJ740GGWJNMZ"
  },
});