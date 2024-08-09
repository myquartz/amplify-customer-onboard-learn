import { defineFunction } from '@aws-amplify/backend';

export const checkIfAnAdmin = defineFunction({
  name: 'checkIfAnAdmin',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './check-if-admin.ts'
});