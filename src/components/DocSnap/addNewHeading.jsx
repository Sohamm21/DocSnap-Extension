import React, { useState } from "react";
import InputWithButton from "./InputWithButton";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../context/AuthContext";

/* global chrome */
const AddNewHeading = ({ selectedDoc }) => {
  const [heading, setHeading] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const { token } = useAuth();

  const getDocLastIndex = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["selectedDocData"], (result) => {
        resolve(result.selectedDocData?.docLastIndex || 0);
      });
    });
  };

  const handleAddNewHeading = async () => {
    if (!heading.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setIsLoading(true);
  
    try {
      const docLastIndex = await getDocLastIndex();
  
      const requestBody = {
        requests: [
          {
            deleteParagraphBullets: {
              range: {
                startIndex: docLastIndex,
                endIndex: docLastIndex + 1,
              },
            },
          },
          {
            insertText: {
              location: { index: docLastIndex },
              text: `\n${heading}\n`,
            },
          },
          {
            updateParagraphStyle: {
              range: {
                startIndex: docLastIndex + 1,
                endIndex: docLastIndex + 1 + heading.length,
              },
              paragraphStyle: { namedStyleType: "HEADING_1" },
              fields: "namedStyleType",
            },
          },
        ],
      };
  
      const res = await fetch(
        `https://docs.googleapis.com/v1/documents/${selectedDoc}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to insert text");
      }
  
      const updatedDocLastIndex = docLastIndex + heading.length + 1;
      chrome.storage.local.get(["selectedDocData"], (result) => {
        const updatedData = {
          ...result.selectedDocData,
          selectedDoc,
          docLastIndex: updatedDocLastIndex,
        };
        chrome.storage.local.set({ selectedDocData: updatedData });
      });
  
      setHeading("");
    } catch (error) {
      console.error("Error inserting text:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <InputWithButton
      isRequired
      showError={showError}
      label="Enter Heading"
      helperText={showError ? "Enter a valid heading" : ""}
      value={heading}
      onChange={(event) => setHeading(event.target.value)}
      isLoading={isLoading}
      disabled={isLoading || !selectedDoc || !heading.trim()}
      icon={<AddIcon />}
      buttonText="Add"
      onClick={handleAddNewHeading}
    />
  );
};

export default AddNewHeading;
