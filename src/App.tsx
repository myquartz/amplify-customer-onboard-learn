import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useTheme, Authenticator, Loader, View, Grid, Card,  Menu, MenuItem, Divider,
  Message, Flex, Fieldset, Button, SelectField, SearchField, Collection } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import CustomerEditForm from "./CustomerEditForm";

const client = generateClient<Schema>();

function App() {
  const [customerList, setCustomerList] = useState<Array<Schema["Customer"]["type"]>>([]);

  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchField, setSearchField ] = useState('nid');
  const [searchValue, setSearchValue] = useState('');

  const [addCustomerForm, setAddCustomerForm ] = useState(false);

  const [errors, setErrors ] = useState([] as Array<Object>);

  const onSearchChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const onSearchClear = () => {
    setSearchValue('');
    setSearch(false);
    setCustomerList([]);
  };

  const { tokens } = useTheme();

  function clearError() {
    setErrors([]);
  }
  function catchError(obj: any) {
    setLoader(false);
    console.error(obj);
    if("object" == typeof obj)
      setErrors(obj.errors ?? [ {message: "Error "+JSON.stringify(obj) }]);
    else
      setErrors([ {message: "Error "+(new String(obj)) }]);
  }

  useEffect(() => {
    if(searchValue)
      return;
    clearError();
    //setSearch(false);
    /*const sub = client.models.Customer.observeQuery().subscribe({
      next: (data) => setCustomerList([...data.items]),
    });
    return () => sub.unsubscribe();*/
  }, [searchValue, searchField]);

  function forceSearch(event: any) {
    //event.preventDefault();
    console.debug('event', event, search, searchField, searchValue);
    if(!searchValue) {
      setErrors([ {message: "Enter value please" }]);
      return;
    }
    setLoader(true);
    setSearch(true);
    switch(searchField) {
    case "cif":
      client.models.Customer.listCustomerByCifNumber({ cifNumber: parseInt(searchValue) }).then(
        (resp) => {
          console.debug('resp',resp);
          setLoader(false);
          clearError();
          setCustomerList(resp.data)
        })
        .catch(catchError);
      break;
    case "phone":
      client.models.Customer.listCustomerByPhoneNumber({ phoneNumber: searchValue }).then(
        (resp) => {
          console.debug('resp',resp);
          setLoader(false);
          clearError();
          setCustomerList(resp.data)
        })
        .catch(catchError);
      break;
    case "nid":
      client.models.Customer.listCustomerByLegalId({ legalId: searchValue }).then(
        (resp) => {
          console.debug('resp',resp);
          setLoader(false);
          clearError();
          setCustomerList(resp.data)
        })
        .catch(catchError);
      break;
    default:
      
    }
  }

  function clickAddNewCustomer(event: any) {
    event.preventDefault();
    console.debug('event', event.target);
    setEditCustomerId('');
    setAddCustomerForm(true);
  }
  
  async function addCustomer(cust: Schema["Customer"]["type"])  {
    try {
      const nextCif = await client.mutations.nextCIFSequence();
      if(nextCif.errors)
        setErrors(nextCif.errors);
      else {
        cust.customerId = nextCif.data?.currentCustomerId ?? (new Date()).toISOString();
        cust.cifNumber = nextCif.data?.currentCifNumber;
        const custResp = await client.models.Customer.create(cust);
        console.log(custResp);
        if(custResp.errors)
          setErrors(custResp.errors);
      }
    }
    catch(err) {
      setErrors([err as any]);
    }
  }

  const [editCustomerId, setEditCustomerId ] = useState('');
  const [customerObj, setCustomerObj ] = useState({} as Schema["Customer"]["type"]);

  useEffect(() => {
    if(!editCustomerId)
      return;
    clearError();
    setCustomerObj({} as Schema["Customer"]["type"]);
    client.models.Customer.get({ customerId: editCustomerId })
    .then(
      (resp) => {
        console.debug('resp',resp);
        setCustomerObj(resp.data as Schema["Customer"]["type"]);
      })
      .catch(catchError);
  }, [editCustomerId]);

  function clickEditCustomer(id: string) {
    if(id)
      setEditCustomerId(id);
    else {
      setEditCustomerId('');
      setCustomerObj({} as Schema["Customer"]["type"]);
    }
  }

  async function updateCustomer(cust: Schema["Customer"]["type"])  {
    try {
      if(!cust.cifNumber) {
        const nextCif = await client.mutations.nextCIFSequence();
        if(nextCif.errors)
          setErrors(nextCif.errors);
        else {
          cust.cifNumber = nextCif.data?.currentCifNumber;
        }
      }

      if(cust.cifNumber) {
        const custResp = await client.models.Customer.update(cust);
        console.log(custResp);
        if(custResp.errors)
          setErrors(custResp.errors);
        else
          setCustomerObj(custResp.data as Schema["Customer"]["type"]);
      }
    }
    catch(err) {
      setErrors([err as any]);
    }
  }

  /*
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
      : search && customerList && customerList.length ? 
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
          <Button onClick={() => clickEditCustomer(item.customerId)} style={{float: 'right'}}>Edit</Button>
          CustomerID: {item.customerId}<br />
          CIF Number: {item.cifNumber}<br />
          Full name: {item.customerName}<br />
          Legal ID: {item.legalId}<br />  
        </Card>
      )}
      </Collection>
    : search ? <div>Data not found</div>
    : <div>Please enter condition to search</div>}
    <Fieldset legend="Toolbox">
      <Button onClick={clickAddNewCustomer} >Add new</Button>
    </Fieldset>
    </Flex>
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    { editCustomerId && customerObj.customerId ? 
        <CustomerEditForm
          customer={customerObj} addCustomer={(cust: Schema["Customer"]["type"]) => console.log("add fake",cust)}
          updateCustomer={updateCustomer}
        />
      : addCustomerForm ?
      <CustomerEditForm
        customer={null} addCustomer={addCustomer}
        updateCustomer={(cust: Schema["Customer"]["type"]) => console.log("update fake",cust)}
      />
      : null
    }
  </Card>
  <Card
    columnStart="2"
    columnEnd="-1"
  >
    { errors.length ? 
      <Flex direction="column" width="100%">
        {errors.map((err: any, index) => (
          <Message key={index} colorTheme="error" heading="Backend error">{err.message}</Message>
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
