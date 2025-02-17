import React, { useState } from "react";
import InputWithButton from "./InputWithButton";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../context/AuthContext";

/* global chrome */
const AddNewHeading = ({ selectedDoc }) => {
  const [heading, setHeading] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      return;
    }
    setIsLoading(true);
  
    try {
      const docLastIndex = await getDocLastIndex();
  
      const requestBody = {
        requests: [
          {
            insertText: {
              location: { index: docLastIndex },
              text: `\n${heading}`,
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
          {
            deleteParagraphBullets: {
              range: {
                startIndex: docLastIndex + 1,
                endIndex: docLastIndex + 1 + heading.length,
              },
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
      inputClassName="doc-id-input"
      buttonClassName="doc-id-button"
      label="Enter Heading"
      helperText={
        <>
          <span>Adds a new heading to the doc.</span> <br />
          <span><b>Note: </b>New points will be added below it.</span>
        </>
      }      
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
