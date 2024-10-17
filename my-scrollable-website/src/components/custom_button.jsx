//src path = my-scrollable-website/my-scrollable-website/src/components/custom_button.jsx
import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = ({ title, ...rest }) => {
  return (
    <Button
      fullWidth
      variant="contained"
      sx={{ mt: 3, mb: 2 }}
      {...rest}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
