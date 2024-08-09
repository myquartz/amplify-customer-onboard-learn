import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { 
  Authenticator, useAuthenticator, 
  View, 
  //useTheme,
  //Grid,
  Loader,
  Card,  Menu, MenuItem, Divider,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import CustomerManager from './Admin/CustomerManager';

const client = generateClient<Schema>();

function App() {
  //const { tokens } = useTheme();
  const [loader, setLoader] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    console.debug('user', user);
    if(!user)
      return;
    setLoader(true);
    client.queries.checkIfAnAdmin({ userId: user.userId }).then((resp) => {
      console.debug('resp', resp);
    });
    client.models.Customer.get({ customerId: user.userId }).then((resp) => {
      console.debug('resp', resp);
      if(resp.data) {
        const cust = resp.data;
        setIsAdmin(cust.legalId == '036078007971');
      }
      setLoader(false);
    });

  },[user]);
  //{({ signOut, user }) => (

  return (  
    <main>
      { user ? null : <h1>Wellcome</h1>}
      <Authenticator>
    <View as="main" alignSelf="flex-start" height="40rem" maxWidth="100%" padding="1rem" width="80rem">
      
        <Card
          style={{ height: '4rem' }}
        >
          <View id="loginId" style={{ float: 'right', marginRight: '1rem', lineHeight: '2rem' }}>{user?.signInDetails?.loginId}</View>
          <Menu>
            <MenuItem onClick={() => alert('Download')}>
              Download
            </MenuItem>
            <MenuItem onClick={() => alert('Create a Copy')}>
              Create a Copy
            </MenuItem>
            <MenuItem onClick={() => alert('Mark as Draft')}>
              Mark as Draft
            </MenuItem>
            <Divider />
            <MenuItem isDisabled onClick={() => alert('Delete')}>
              Delete
            </MenuItem>
            <MenuItem onClick={signOut}>
              Sign out
            </MenuItem>
          </Menu>
        </Card>

      {
        loader ? <Loader />
        : isAdmin ? <CustomerManager />
        : <main>Hello</main>
      }
      </View>
      </Authenticator>
    </main>
  );
  //)}
  //return (<main>Hello</main>);
}

export default App;
