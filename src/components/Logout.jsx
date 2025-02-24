import React from "react";

import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpIcon from '@mui/icons-material/Help';

import { useAuth } from "../context/AuthContext";

import "./DocSnap/index.css";

/* global chrome */
const Logout = () => {
  const { token, setToken } = useAuth();
  const handleLogout = () => {
    if (token) {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        setToken(null);
        chrome.runtime.sendMessage({ action: "logout" });
      });

      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {})
        .catch((error) => console.error("Error revoking session:", error));
    }
  };

  return (
    <div className="logout-button">
      <span className="help-btn" onClick={() => {window.open('https://sohamm21.github.io/DocSnap-Extension/','_blank');}}><HelpIcon /></span>
      <Button
        variant="contained"
        sx={{
          textTransform: "none",
        }}
        onClick={handleLogout}
        color="error"
        startIcon={<LogoutIcon />}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default Logout;
