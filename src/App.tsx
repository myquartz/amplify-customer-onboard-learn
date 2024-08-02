import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useAuthenticator, Authenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  const { authStatus } = useAuthenticator(context => [context.authStatus]);
  const [forceLogin, setForceLogin] = useState('');

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function refreshTodo() {
    client.models.Todo.list().then((data) => setTodos(data.data));
  }

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  const handleLogin = async () => {
    setForceLogin('please');
  };

  return (  
    <main>
      {authStatus === 'configuring' && 'Loading...'}
      {authStatus !== 'authenticated' || forceLogin == 'please' ?
      <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <Button onClick={refreshTodo}>Refresh</Button>
          <Button onClick={createTodo}>+ new</Button>
          <ul>
            {todos.map((todo) => (
              <li 
              onClick={() => deleteTodo(todo.id)}
              key={todo.id}>{todo.content}</li>
            ))}
          </ul>
          <div>
            <Button onClick={signOut}>Sign out</Button>
          </div>
        </div>    
      )}
    </Authenticator>
    : <div>
        <h1>Anonymous list todos</h1>
        <Button onClick={refreshTodo}>Refresh</Button>
        <Button onClick={createTodo}>+ new</Button>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.content}</li>
          ))}
        </ul>
        <div>
          <Button onClick={handleLogin}>Click here to login</Button>
        </div>
      </div>
    }
    </main>
  );
}

export default App;
