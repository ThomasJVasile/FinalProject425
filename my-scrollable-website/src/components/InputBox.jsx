import React from 'react';
import TextField from '@mui/material/TextField';

const InputBox = ({ label, type, ...rest }) => {
  return (
    <TextField
      variant="outlined"
      fullWidth
      label={label}
      type={type}
      margin="normal"
      {...rest}
    />
  );
};

export default InputBox;
