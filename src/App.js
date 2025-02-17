import React, { useState } from "react";

import "./App.css";
import Login from "./components/Login";
import DocSnapWrapper from "./components/DocSnap";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RefreshExtension from "./components/DocSnap/refreshExtension";
import { CircularProgress } from "@mui/material";

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

const MainApp = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token } = useAuth();

  return (
    <>
      <div className="header">
        <span className="title-container">
          <h1 className="title">
            <span className="doc">Doc</span>
            <span className="snap">Snap</span>
          </h1>
          <span className="subtitle">Quickly add notes to your Docs</span>
        </span>
        {token && <RefreshExtension setIsRefreshing={setIsRefreshing} />}
      </div>
      {isRefreshing ? (
        <CircularProgress />
      ) : !token ? (
        <Login />
      ) : (
        <DocSnapWrapper />
      )}
    </>
  );
};

export default App;
