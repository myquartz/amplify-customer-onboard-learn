import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator, Button, Flex, Fieldset, TextField, CheckboxField } from '@aws-amplify/ui-react';
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
  */
/*
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  <Button onClick={refreshTodo}>Refresh</Button>
    */

  return (  
    <Authenticator>
      {
      ({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          
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
        <Button type="submit">Seach</Button>
    </Fieldset>
  </Flex> : <span>No action</span>
  }
            <Button onClick={signOut}>Sign out</Button>
          </div>
        </main>)
    }
    </Authenticator>
  );
}

export default App;
