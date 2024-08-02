import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { Authenticator, Button, Flex, Fieldset, TextAreaField, CheckboxField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const [editingContent, setEditingContent ] = useState('');
  const [showEditForm, setEditForm ] = useState(false);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function refreshTodo() {
    client.models.Todo.list().then((data) => setTodos(data.data));
  }

  function showCreateTodo() {
    setEditForm(true);
  }

  function createTodo(event: any) {
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

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (  
    <Authenticator>
      {
      ({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <Button onClick={refreshTodo}>Refresh</Button>
          <Button onClick={showCreateTodo}>+ new</Button>
          <ul>
            {todos.map((todo) => (
              <li 
              key={todo.id}>{todo.content}
              <CheckboxField
                label="done"
                name="isDone" readOnly={false}
                checked={todo?.isDone?true:false}
                onChange={(event) => toggleDoneState(todo.id, event.target.checked)}
              /></li>
            ))}
          </ul>
          <div>
  {
  showEditForm ? 
  <Flex as="form" direction="column" onSubmit={createTodo}>
    <Fieldset
      legend="Add new to do"
      variation="plain"
      direction="column">
        <TextAreaField name="content" label="To do note" placeholder="Please enter your text" value={editingContent} 
          onChange={(event) => setEditingContent(event.target.value)}
          isRequired={true} readOnly={false} />
        <Button type="submit">Create</Button>
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
