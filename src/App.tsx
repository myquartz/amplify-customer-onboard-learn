import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

/*import { withInAppMessaging } from '@aws-amplify/ui-react-notifications';
import {
  syncMessages,
  identifyUser,
  dispatchEvent
} from 'aws-amplify/in-app-messaging';
import { record } from 'aws-amplify/analytics';*/

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
import CustomerSelfOnboard from './View/CustomerSelfOnboard';

const client = generateClient<Schema>({ authMode: "userPool" });

const myFirstEvent = { name: 'my_first_event' };

function App() {
  //const { tokens } = useTheme();
  const [loader, setLoader] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkProfile, setCheckProfile] = useState<Schema["checkIfAnAdmin"]["returnType"]>();
  const [customerProfile, setCustomerProfile] = useState<Schema["Customer"]["type"]>();

  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    console.debug('user', user);
    if(!user)
      return;
    setLoader(v => v+1);
    client.queries.checkIfAnAdmin({ username: user.username }).then((resp) => {
      console.debug('checkIfAnAdmin resp', resp);
      setLoader(v => v-1);
      
      if(resp.data) {
        setCheckProfile(resp.data);
        setIsAdmin(resp.data.requesterIsCIFOperators || resp.data.requesterIsCIFAdmins || false)

        setLoader(v => v+1);
        client.models.Customer.get({ customerId: user.username }).then((resp) => {
          console.debug('Customer get resp', resp);
          if(resp.data) {
            setCustomerProfile(resp.data);
          }
          setLoader(v => v-1);
        });
        /*record({
          name: 'checkIfAnAdmin'
        });*/
      }
    });
    /*identifyUser({
      userId: user.userId,
      userProfile: {
        
      },
      options: {
        address: 'Somewhere',
        optOut: 'NONE'
      }
    }).then((resp) => {
      console.log("identifyUser resp",resp);
      syncMessages().then((syncResp => {
        console.log("syncMessages resp",syncResp);
        dispatchEvent(myFirstEvent);
      }));
    })*/
    
  },[user]);
  //{({ signOut, user }) => (

  return (  
    <main>
      { user ? null : <h1>Welcome {user}</h1>}
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
        : customerProfile ? <main>
          Hello: {customerProfile.customerName}
          <pre>
            {JSON.stringify(customerProfile, null, 2)}
          </pre>
          </main>
        : <CustomerSelfOnboard userProfile={user} checkProfile={checkProfile} />
      }
      </View>
      </Authenticator>
    </main>
  );
  //)}
  //return (<main>Hello</main>);
}

export default App;
//export default withInAppMessaging(App);
