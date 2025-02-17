import React from "react";

import Button from "@mui/material/Button";
import FileOpenIcon from "@mui/icons-material/FileOpen";

import "./index.css";

const OpenSelectedDoc = ({ selectedDoc }) => {
  const handleOpenSelectedDoc = () => {
    if (selectedDoc) {
      window.open(
        `https://docs.google.com/document/d/${selectedDoc}/edit`,
        "_blank"
      );
    }
  };
  return (
    <Button
      variant="outlined"
      sx={{
        textTransform: "none",
        "&.Mui-disabled": {
          cursor: "not-allowed",
          pointerEvents: "auto",
        },
      }}
      startIcon={<FileOpenIcon />}
      onClick={handleOpenSelectedDoc}
      disabled={!selectedDoc}
      className="open-selected-doc-button"
    >
      Open Selected Doc
    </Button>
  );
};

export default OpenSelectedDoc;
