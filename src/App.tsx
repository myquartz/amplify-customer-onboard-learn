import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator, View, Grid, Card,  Menu, MenuItem, Divider,
   Button, Flex, Fieldset, TextField,} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  const [customerList, setCustomerList] = useState<Array<Schema["Customer"]["type"]>>([]);

  const [editCustomerId, setEditCustomerId ] = useState('');
  const [searchingPhone, setSearchingPhone ] = useState('');
  const [searchingCIFNumber, setSearchingCIFNumber ] = useState(0);
  const [showSearchForm, setShowSearchForm ] = useState(false);

  useEffect(() => {
    if(searchingCIFNumber > 0) {
      client.models.Customer.listCustomerByCifNumber({ cifNumber: searchingCIFNumber }).then(
        (resp) => {
          setCustomerList(resp.data)
        });
    }
    else if(searchingPhone) {
      client.models.Customer.listCustomerByPhoneNumber({ phoneNumber: searchingPhone }).then(
        (resp) => {
          setCustomerList(resp.data)
        });
    }
    else {
      const sub = client.models.Customer.observeQuery().subscribe({
        next: (data) => setCustomerList([...data.items]),
      });
      return () => sub.unsubscribe();
    }
  }, [searchingPhone, searchingCIFNumber]);

  function openSearchForm() {
    if(showSearchForm) {
      setSearchingPhone('');
      setSearchingCIFNumber(0);
      setEditCustomerId('');
      setShowSearchForm(false);  
    }
    else
      setShowSearchForm(true);
  }

  function forceSearch(event: any) {
    event.preventDefault();
    console.debug('event', event.target);
    client.models.Customer.list().then(
      (resp) => {
        console.debug('data', resp);
        setCustomerList(resp.data)
      });
  }

  /*function createTodo(event: any) {
    event.preventDefault();
    console.debug('event', event.target);
    client.models.Todo.create({content:event.target.content.value})
    .then( (data) => {
      console.debug('data',data);
      setEditForm(false);
    });
  }
  
  function toggleDoneState(id: string, isDoneNew: boolean) {
    const c = todos.find((i) => i.id == id);
    if(c) {
      let newTodos = todos.filter((i) => i.id != id);
      const newTodo = {
        id: id,
        content: c.content,
        isDone: isDoneNew
      };
      client.models.Todo.update(newTodo)
      .then((d) => {
        //c.isDone = d.data?.isDone;
        newTodos.push({ ...d.data } as Schema["Todo"]["type"]);
        setTodos(newTodos);
      });
    }
  }
  
/*
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  <Button onClick={refreshTodo}>Refresh</Button>
    */

  return (  
    <Authenticator>
      {({ signOut, user }) => (
        <View as="main" height="40rem" maxWidth="100%" padding="1rem" width="80rem">
          <Grid
  columnGap="0.5rem"
  rowGap="0.5rem"
  templateColumns="1fr 1fr 1fr"
  templateRows="1fr 3fr 1fr"
>
  <Card
    columnStart="1"
    columnEnd="-1"
  >
    <View id="loginId">{user?.signInDetails?.loginId}</View>
    <Menu menuAlign="end">
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
  <Card
    columnStart="1"
    columnEnd="2"
  >
    Nav
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
     <Button onClick={openSearchForm}>search</Button>
          <ul>
            {customerList.map((cust) => (
              <li key={cust.customerId}>
                CustomerID: {cust.customerId}<br />
                CIF Number: {cust.cifNumber}<br />
                Full name: {cust.customerName}<br />
                Legal ID: {cust.legalId}<br />  
              </li>
            ))}
          </ul>
          <div>
  {
  showSearchForm ? 
  <Flex as="form" direction="column">
    {editCustomerId}
    <Fieldset
      legend="Add new to do"
      variation="plain"
      direction="column">
        <TextField name="cifNumber" label="Seach by CIFNumber" placeholder="Your number" value={searchingCIFNumber} 
          readOnly={false} />
        <Button type="submit" onClick={forceSearch}>Seach</Button>
    </Fieldset>
  </Flex> : <span>No action</span>
  }
          </div>
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    Footer
  </Card>
</Grid>

          
          
          
         
      </View>
    )}
    </Authenticator>
  );
  //return (<main>Hello</main>);
}

export default App;
