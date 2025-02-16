import React, { useState, useEffect } from "react";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import InputWithButton from "./InputWithButton";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../context/AuthContext";

/* global chrome */
const SelectRecentDoc = ({ options, setOptions, selectedDoc, setSelectedDoc }) => {
  const { token } = useAuth();
  const [docId, setDocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ showError: false, message: "" });

  const fetchOptions = () => {
    chrome.storage.sync.get(["recentDocs"], (result) => {
      const existingDocs = result?.recentDocs || [];
      setOptions(existingDocs);
    });
  };

  useEffect(() => {
    fetchOptions();
    chrome.storage.local.get("selectedDoc", (result) => {
      if (result?.selectedDoc) {
        setSelectedDoc(result?.selectedDoc);
      }
    });
  }, []);

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
      setErrorInfo({ showError: true, message: error.message });
    }
    setIsLoading(false);
  };

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
      setErrorInfo({ showError: false, message: "" });
    }, 5000);
  }, [errorInfo.showError]);

  const getDocLastIndex = (docData) => {
    const content = docData?.body?.content;

    if (!content || content.length === 0) {
      return 0;
    }
    return content[content.length - 1].endIndex - 1;
  }

  const handleDropdownChange = async (event) => {
    setSelectedDoc(event.target.value);
    chrome.storage.local.set({ selectedDoc: event.target.value });

    const res = await fetchDocWithId(event.target.value);
    if (!res.ok) {
      return;
    }
    const docData = await res.json();
    const docLastIndex = getDocLastIndex(docData);

    chrome.storage.local.get(["selectedDocData"], (result) => {
      chrome.storage.local.set(
        {
          selectedDocData: {
            ...result.selectedDocData,
            docId: event.target.value,
            docLastIndex,
          },
        },
        () => {}
      );
    });
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
        disabled={(isLoading || docId.trim() === "") ? true : false}
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
