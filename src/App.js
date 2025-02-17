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
    <>
      <div className="header">
        <h1 className="title">
          <span className="doc">Doc</span>
          <span className="snap">Snap</span>
        </h1>
        <span className="subtitle">Quickly add notes to your Docs</span>
      </div>
      {!token ? <Login /> : <DocSnapWrapper />}
    </>
  );
};

export default App;
