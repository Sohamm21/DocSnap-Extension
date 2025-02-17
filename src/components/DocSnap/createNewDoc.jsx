import React, { useState } from "react";

import Button from "@mui/material/Button";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

import { useAuth } from "../../context/AuthContext";
import InputWithButton from "./InputWithButton";

import "./index.css";

/* global chrome */
const CreateNewDoc = ({ setOptions }) => {
  const { token } = useAuth();
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [showError, setShowError] = useState(false);
  const [title, setTitle] = useState("Untitled");
  const [loading, setLoading] = useState(false);

  const handleCreateNewDoc = async () => {
    if (!title.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setLoading(true);
    try {
      const res = await fetch(
        `https://docs.googleapis.com/v1/documents?title=${title}`,
        {
          method: "POST",
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to create document");
      }
      
      const data = await res.json();
      const newDoc = { value: data.documentId, label: title };
      
      chrome.storage.sync.get(["recentDocs"], (result) => {
        const existingDocs = result?.recentDocs || [];
        const updatedDocs = [newDoc, ...existingDocs].slice(0, 5);
        
        chrome.storage.sync.set({ recentDocs: updatedDocs }, () => {
          setOptions(updatedDocs);
          setIsCreatingDoc(false);
        });
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const renderInputWithButton = () => {
    return (
      <InputWithButton
        inputClassName="doc-id-input"
        buttonClassName="doc-id-button"
        isRequired
        showError={showError}
        label="Enter Doc Name"
        helperText={showError ? "Title is required" : ""}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        isLoading={loading}
        disabled={loading}
        icon={<NoteAddIcon />}
        buttonText="Create"
        onClick={handleCreateNewDoc}
      />
    );
  };

  const renderContent = () => {
    return isCreatingDoc ? (
      renderInputWithButton()
    ) : (
      <Button
        sx={{ textTransform: "none" }}
        variant="contained"
        startIcon={<NoteAddIcon />}
        onClick={() => setIsCreatingDoc(true)}
        className="create-new-doc-button"
      >
        Create New Doc
      </Button>
    );
  };

  return renderContent();
};

export default CreateNewDoc;
