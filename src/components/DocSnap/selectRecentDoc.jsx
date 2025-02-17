import React, { useEffect } from "react";

import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import { useAuth } from "../../context/AuthContext";

import "./index.css";

/* global chrome */
const SelectRecentDoc = ({
  options,
  setOptions,
  selectedDoc,
  setSelectedDoc,
}) => {
  const { token } = useAuth();

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

  const getDocLastIndex = (docData) => {
    const content = docData?.body?.content;

    if (!content || content.length === 0) {
      return 0;
    }
    return content[content.length - 1].endIndex - 1;
  };

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
    <div className="select-recent-doc">
      <span className="recent-doc-label">Select Doc:</span>
      <Select
        value={selectedDoc}
        onChange={handleDropdownChange}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        className="recent-doc-dropdown"
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#696969",
              color: "#FFFFFF",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
              borderRadius: "8px",
            },
          },
          MenuListProps: {
            sx: {
              backgroundColor: "#121212",
              padding: 0,
            },
          },
        }}
        sx={{
          backgroundColor: "#333",
          color: "#bababa",
          height: "38px",
          "& .MuiSvgIcon-root": { color: "#fff" },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#696969",
            transition: "border-color 0.3s ease-in-out",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#555 !important",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#9a9a9a",
          },
        }}
      >
        <MenuItem
          value={null}
          className="recent-doc-option-menu"
          sx={{
            backgroundColor: "#121212",
            color: "#fff",
            "&:hover": {
              backgroundColor: "#1e1e1e",
            },
            "&.Mui-selected": {
              backgroundColor: "#2a2a2a",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#3a3a3a",
              },
            },
          }}
        >
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            className="recent-doc-option-menu"
            sx={{
              backgroundColor: "#121212",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1e1e1e",
              },
              "&.Mui-selected": {
                backgroundColor: "#2a2a2a",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                },
              },
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default SelectRecentDoc;
