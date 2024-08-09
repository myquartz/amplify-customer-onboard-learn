import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { checkIfAnAdmin } from './functions/resource';

//const backend = 
defineBackend({
  auth,
  data,
  checkIfAnAdmin,
});

/*const { cfnIdentityPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = true;*/