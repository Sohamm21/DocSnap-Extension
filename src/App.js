import React from "react";

import "./App.css";
import Login from "./components/Login";
import DocSnapWrapper from "./components/DocSnap";
import { AuthProvider, useAuth } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const { token } = useAuth();
  return (
    <div>
      <h1>DocSnap</h1>
      {!token ? <Login /> : <DocSnapWrapper />}
    </div>
  );
};

export default App;
