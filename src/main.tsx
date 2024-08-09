import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Authenticator.Provider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Authenticator.Provider>
);
