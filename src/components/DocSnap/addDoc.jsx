import React, { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";

import { useAuth } from "../../context/AuthContext";
import InputWithButton from "./InputWithButton";
import "./index.css";

/* global chrome */
const AddDoc = ({ options, setOptions }) => {
  const [docId, setDocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ showError: false, message: "" });
  const { token, setToken } = useAuth();

  useEffect(() => {
    setTimeout(() => {
      setErrorInfo({ showError: false, message: "" });
    }, 5000);
  }, [errorInfo.showError]);

  const fetchDocWithId = async (id) => {
    try {
      const res = await fetch(
        `https://docs.googleapis.com/v1/documents/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res;
    } catch (error) {
      throw error;
    }
  };

  const handleAddDocWithId = async () => {
    if (!docId.trim()) {
      return;
    }

    if ((options || []).find((option) => option.value === docId)) {
      setErrorInfo({
        showError: true,
        message: "The document ID you entered already exists.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchDocWithId(docId);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            "The document ID you entered is incorrect or does not exist."
          );
        } else if (res.status === 401) {
          throw new Error("UNAUTHENTICATED");
        } else {
          throw new Error(
            "Unable to fetch document. Please check your access and try again."
          );
        }
      }
      setDocId("");
      const docData = await res.json();
      const newDoc = { value: docData?.documentId, label: docData?.title };
      chrome.storage.sync.get(["recentDocs"], (result) => {
        const existingDocs = result.recentDocs || [];
        const updatedDocs = [newDoc, ...existingDocs].slice(0, 5);
        chrome.storage.sync.set({ recentDocs: updatedDocs }, () => {
          setOptions(updatedDocs);
        });
      });
    } catch (error) {
      if (error.message === "UNAUTHENTICATED") {
        chrome.identity.removeCachedAuthToken({ token }, () => {});
        setToken(null);
      } else {
        setErrorInfo({ showError: true, message: error.message });
      }
    }
    setIsLoading(false);
  };

  return (
    <InputWithButton
      label="Enter Doc Id"
      showError={errorInfo.showError}
      inputClassName="doc-id-input"
      buttonClassName="doc-id-button"
      helperText={
        <span>
          {errorInfo.showError ? (
            errorInfo.message
          ) : (
            <span>
              Find it in the Google Doc URL between <code>/d/</code> and{" "}
              <code>/edit</code>.
            </span>
          )}
        </span>
      }
      value={docId}
      onChange={(event) => setDocId(event.target.value)}
      isLoading={isLoading}
      disabled={isLoading || docId.trim() === "" ? true : false}
      icon={<AddIcon />}
      buttonText="Add"
      onClick={handleAddDocWithId}
    />
  );
};

export default AddDoc;
