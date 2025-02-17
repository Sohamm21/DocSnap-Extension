import React from "react";

import RefreshIcon from "@mui/icons-material/Refresh";
import { useAuth } from "../../context/AuthContext";
import { fetchDocWithId, getDocLastIndex } from "./utils";

/* global chrome */
const RefreshExtension = ({ setIsRefreshing }) => {
  const { token } = useAuth();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    chrome.storage.local.get("selectedDoc", async (result) => {
      if (result?.selectedDoc) {
        try {
          const res = await fetchDocWithId(result.selectedDoc, token);
          if (!res.ok) {
            setIsRefreshing(false);
            return;
          }
          const docData = await res.json();
          const docLastIndex = getDocLastIndex(docData);

          chrome.storage.local.get(["selectedDocData"], (result) => {
            chrome.storage.local.set(
              {
                selectedDocData: {
                  ...result.selectedDocData,
                  docId: result?.selectedDoc,
                  docLastIndex,
                },
              },
              () => {}
            );
          });
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
      setIsRefreshing(false);
    });
  };

  return (
    <span onClick={handleRefresh} className="refresh-button">
      <RefreshIcon />
    </span>
  );
};

export default RefreshExtension;
