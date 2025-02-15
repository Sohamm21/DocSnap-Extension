import React from "react";
import { useAuth } from "../context/AuthContext";

/* global chrome */
const Login = () => {
  const { setToken } = useAuth();
  const handleLogin = () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        return;
      }
      setToken(token);
    });
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
