import React, { useState, useEffect } from "react";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import InputWithButton from "./InputWithButton";
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from "../../context/AuthContext";

/* global chrome */
const SelectRecentDoc = ({ options, setOptions }) => {
  const { token } = useAuth();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docId, setDocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({showError: false, message: ""});

  const fetchOptions = () => {
    chrome.storage.sync.get(["recentDocs"], (result) => {
      const existingDocs = result?.recentDocs || [];
      setOptions(existingDocs);
    });
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    chrome.storage.sync.get("selectedDoc", (result) => {
      if (result?.selectedDoc) {
        setSelectedDoc(result?.selectedDoc);
      }
    });
  }, []);

  const handleAddDocWithId = async () => {
    if (!docId.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://docs.googleapis.com/v1/documents/${docId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("The document ID you entered is incorrect or does not exist.");
        } else {
          throw new Error("Unable to fetch document. Please check your access and try again.");
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
      setErrorInfo({showError: true, message: error.message});
    }
    setIsLoading(false);
  }

  const handleOpenSelectedDoc = () => {
    if (selectedDoc) {
      window.open(
        `https://docs.google.com/document/d/${selectedDoc}/edit`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setErrorInfo({showError: false, message: ""});
    }, 5000);
  }, [errorInfo.showError]);

  const handleDropdownChange = (event) => {
    setSelectedDoc(event.target.value);
    chrome.storage.sync.set({ selectedDoc: event.target.value });
  };

  return (
    <>
      <span>Doc To Use:</span>
      <Select
        value={selectedDoc}
        onChange={handleDropdownChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
      >
        <MenuItem value={null}>
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <InputWithButton
        label="Enter Doc Id"
        showError={errorInfo.showError}
        helperText={
          <span>
            Find it in the Google Doc URL between <code>/d/</code> and <code>/edit.</code> <br />
            {errorInfo.showError ? errorInfo.message : null}
          </span>
        }
        value={docId}
        onChange={(event) => setDocId(event.target.value)}
        isLoading={isLoading}
        disabled={isLoading}
        icon={<AddIcon />}
        buttonText="Add"
        onClick={handleAddDocWithId}
      />
      <Button
        variant="contained"
        sx={{ textTransform: "none" }}
        startIcon={<FileOpenIcon />}
        onClick={handleOpenSelectedDoc}
        disabled={!selectedDoc}
      >
        Open Selected Doc
      </Button>
    </>
  );
};

export default SelectRecentDoc;
