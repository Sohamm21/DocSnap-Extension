import React from "react";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const InputWithButton = ({
  showError,
  isRequired,
  value,
  onClick,
  icon,
  isLoading,
  buttonText,
  onChange,
  helperText,
  label,
}) => {
  return (
    <div>
      <TextField
        required={isRequired}
        error={showError}
        helperText={helperText}
        id="outlined-basic"
        label={label}
        variant="outlined"
        value={value}
        onChange={onChange}
      />
      <Button
        sx={{ textTransform: "none" }}
        loading={isLoading}
        disabled={isLoading}
        variant="contained"
        startIcon={icon}
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default InputWithButton;
