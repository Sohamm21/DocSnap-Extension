import React from "react";
import { useAuth } from "../context/AuthContext";

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
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
