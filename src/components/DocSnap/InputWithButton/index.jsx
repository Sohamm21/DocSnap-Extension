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
  inputClassName,
  buttonClassName,
  disabled,
}) => {
  return (
    <div className="input-with-button">
      <TextField
        size="small"
        sx={{
          '& .MuiInputLabel-root.Mui-focused': {
          color: 'white',
        },
        }}
        autoComplete="off"
        required={isRequired}
        error={showError}
        helperText={helperText}
        id="outlined-basic"
        label={label}
        variant="outlined"
        value={value}
        onChange={onChange}
        className={inputClassName}
      />
      <Button
        sx={{
          textTransform: "none",
          "&.Mui-disabled": {
            cursor: "not-allowed",
            pointerEvents: "auto",
          },
        }}
        loading={isLoading}
        disabled={disabled}
        variant="contained"
        startIcon={icon}
        onClick={onClick}
        className={buttonClassName}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default InputWithButton;
