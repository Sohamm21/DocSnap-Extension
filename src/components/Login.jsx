import React, { useState } from "react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "../context/AuthContext";
import "./DocSnap/index.css";

/* global chrome */
const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuth();

  const handleLogin = () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        return;
      }
      setIsLoading(true);
      setToken(token);
      chrome.storage.local.set({ token }, () => {
        setIsLoading(false);
      });
    });
  };

  return (
    <div className="login-container">
      {isLoading ? (
        <div className="loader">
          <CircularProgress />
        </div>
      ) : (
        <Button
          onClick={handleLogin}
          variant="contained"
          startIcon={<GoogleIcon />}
          sx={{ textTransform: "none" }}
          className="login-button"
        >
          Sign in with Google
        </Button>
      )}
    </div>
  );
};

export default Login;
