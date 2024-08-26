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
  ColorMode, ThemeProvider,
  //Grid,
  Loader,
  Card,  Menu, MenuItem, Divider,
  useTheme,
  Heading,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './Themes';

import CustomerManager from './Admin/CustomerManager';
import CustomerSelfOnboard from './View/CustomerSelfOnboard';
import CustomerView from "./View/CustomerView";

const client = generateClient<Schema>({ authMode: "userPool" });

const myFirstEvent = { name: 'my_first_event' };

function App() {

  const [colorMode, setColorMode] = useState<ColorMode>('system');
  const [loader, setLoader] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkProfile, setCheckProfile] = useState<Schema["checkIfAnAdmin"]["returnType"]>();
  const [customerProfile, setCustomerProfile] = useState<Schema["Customer"]["type"]>();

  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const { tokens } = useTheme();

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
        client.models.Customer.get({ customerId: user.username }, {
          selectionSet: ["customerId","customerName","cifNumber","legalId","dateOfBirth","phoneNumber","gender", "createdAt"]
        }).then((resp) => {
          console.debug('Customer get resp', resp);
          if(resp.data) {
            setCustomerProfile(resp.data as Schema["Customer"]["type"]);
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

  const nextColorMode = colorMode == 'system' ? 'dark': colorMode == 'dark' ? 'light' : 'system';
  return (
  <ThemeProvider theme={theme} colorMode={colorMode}>
    <View alignSelf="flex-start" width="100%" height="100%" padding="0" overflow="hidden" backgroundColor={tokens.colors.background.primary}>
      { user ? <View backgroundColor={tokens.colors.background.tertiary}
          style={{ height: '4rem', padding: '1rem' }}>
          <View id="loginId" style={{ float: 'right', marginRight: '0', lineHeight: '2rem' }} color={tokens.colors.font.focus}>{user?.signInDetails?.loginId}</View>
          <Menu>
            <MenuItem onClick={() => alert('Download')}>
              Download
            </MenuItem>
            <MenuItem onClick={() => alert('Create a Copy')}>
              Create a Copy
            </MenuItem>
            <MenuItem onClick={() => setColorMode(nextColorMode)}>
              To {nextColorMode} mode
            </MenuItem>
            <Divider />
            <MenuItem isDisabled onClick={() => alert('Delete')}>
              Delete
            </MenuItem>
            <MenuItem onClick={signOut}>
              Sign out
            </MenuItem>
          </Menu>
        </View> : <View alignSelf="flex-start" textAlign="center" width="100%" padding="0" height="6rem" paddingTop="2rem">
          <Heading level={2} color={tokens.colors.font.focus}>Welcome to Onboarding</Heading>
        </View>}
      <Authenticator>
      <View as="main" alignSelf="flex-start" width="100%" padding="1rem">
        {
          loader ? <Loader />
          : isAdmin ? <CustomerManager />
          : customerProfile ? <CustomerView customerProfile={customerProfile} />
          : <CustomerSelfOnboard userProfile={user} checkProfile={checkProfile} />
        } 
      </View>
      </Authenticator>
    </View>
  </ThemeProvider>
  );
}

export default App;
//export default withInAppMessaging(App);
