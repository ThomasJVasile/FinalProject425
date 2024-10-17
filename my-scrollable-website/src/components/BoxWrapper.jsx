// src/components/BoxWrapper.jsx
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

const BoxWrapper = ({ title, maxWidth = 'sm', children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <Container maxWidth={maxWidth}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: '#f5f5f5',
          }}
        >
          {title && (
            <Typography component="h1" variant="h5" color="black">
              {title}
            </Typography>
          )}
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default BoxWrapper;
