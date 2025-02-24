import React, { createContext, useContext, useState, useEffect } from "react";

/* global chrome */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (!chrome.runtime.lastError && token) {
        fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              console.error("Token invalid or expired:", data.error);
              chrome.identity.removeCachedAuthToken({ token }, () => {
                setToken(null);
              });
            } else {
              setToken(token);
            }
          })
          .catch(error => {
            console.error("Error validating token:", error);
            setToken(null);
          });
      } else {
        setToken(null);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
