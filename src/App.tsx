import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useTheme, Authenticator, Loader, View, Grid, Card,  Menu, MenuItem, Divider,
  Message, Flex, Fieldset, SelectField, SearchField, Collection } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import CustomerEditForm from "./CustomerEditForm";

const client = generateClient<Schema>();

function App() {
  const [customerList, setCustomerList] = useState<Array<Schema["Customer"]["type"]>>([]);

  //const [editCustomerId, setEditCustomerId ] = useState('');
  const [loader, setLoader] = useState(false);
  const [searchField, setSearchField ] = useState('nid');
  const [searchValue, setSearchValue] = useState('');

  const [errors, setErrors ] = useState([] as Array<Object>);

  const onSearchChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const onSearchClear = () => {
    setSearchValue('');
    setCustomerList([]);
  };

  const { tokens } = useTheme();

  useEffect(() => {
    setLoader(true);
    switch(searchField) {
    case "cif":
      client.models.Customer.listCustomerByCifNumber({ cifNumber: parseInt(searchValue) }).then(
        (resp) => {
          setCustomerList(resp.data)
        })
        .catch((err) => setErrors(err.errors ?? [ {message: "Error "+JSON.stringify(err) }]));
      break;
    case "phone":
      client.models.Customer.listCustomerByPhoneNumber({ phoneNumber: searchValue }).then(
        (resp) => {
          setCustomerList(resp.data)
        })
        .catch((err) => setErrors(err.errors ?? [ {message: "Error "+JSON.stringify(err) }]));
      break;
    case "nid":
      client.models.Customer.list().then( //{ legalId: searchValue }
        (resp) => {
          setCustomerList(resp.data)
        })
        .catch((err) => setErrors(err.errors ?? [ {message: "Error "+JSON.stringify(err) }]));
      break;
    default:
      const sub = client.models.Customer.observeQuery().subscribe({
        next: (data) => setCustomerList([...data.items]),
      });
      return () => sub.unsubscribe();
    }
  }, [searchValue, searchField]);

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
  <View as="main" alignSelf="flex-start" height="40rem" maxWidth="100%" padding="1rem" width="80rem">
      <Grid
        gap={tokens.space.small}
        templateColumns={{ base: '1fr', large: '1fr 1fr 1fr' }}
        templateRows="1fr 5fr 1fr"
      >
  <Card
    columnStart="1"
    columnEnd="-1"
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
  <Card
    columnStart="1"
    columnEnd="2"
    rowSpan={2}
  >
    <Flex direction="column" width="100%">
      <Fieldset legend="Customer searching">
        <Flex direction="row" width="100%">
          <SelectField label="search field" labelHidden={true} value={searchField} onChange={(e) => setSearchField(e.target.value)}>
              <option value="nid">NID</option>
              <option value="phone">Phone</option>
              <option value="cif">CIF</option>
          </SelectField>
          <SearchField
            label="Search"
            placeholder="search value"
            onSubmit={forceSearch}
            onClear={onSearchClear}
            onChange={onSearchChange}
          />
        </Flex>
    </Fieldset>
    {
      loader ? <Loader />
      : customerList.length ? 
      <Collection
        items={customerList}
        type="list"
        direction="column"
        gap={tokens.space.small}
        wrap="nowrap"
      >
      {(item, index) => (
        <Card
          key={index}
          borderRadius="medium"
          maxWidth="100%"
          variation="outlined"
        >
          CustomerID: {item.customerId}<br />
              CIF Number: {item.cifNumber}<br />
              Full name: {item.customerName}<br />
              Legal ID: {item.legalId}<br />  
        </Card>
      )}
      </Collection>
    : <div>Please enter condition to search</div>}
    </Flex>
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    <CustomerEditForm
      customer={null} addCustomer={(cust: Schema["Customer"]["type"]) => { console.log("add",cust); return ""}}
      updateCustomer={(cust: Schema["Customer"]["type"]) => console.log("update",cust)}
    />
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    { errors.length ? 
      <Flex direction="column" width="100%">
        {errors.map((err: any) => (
          <Message colorTheme="error" heading="Backend error">{err.message}</Message>
        ))}
      </Flex>
      : <Message  colorTheme="neutral">No errors so far.</Message>
    }
  </Card>
</Grid>

          
          
          
         
      </View>
    )}
    </Authenticator>
  );
  //return (<main>Hello</main>);
}

export default App;
