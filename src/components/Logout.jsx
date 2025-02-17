import React from "react";

import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "../context/AuthContext";

import "./DocSnap/index.css";

/* global chrome */
const Logout = () => {
  const { token, setToken } = useAuth();
  const handleLogout = () => {
    if (token) {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        setToken(null);
      });

      fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
        .then(() => {})
        .catch((error) => console.error("Error revoking session:", error));
    }
  };

  return (
    <div className="logout-button">
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
