// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { FormHelperText } from '@mui/material';
import InputBox from '../components/InputBox';
import CustomButton from '../components/custom_button';
import BoxWrapper from '../components/BoxWrapper';
import { validateEmail } from '../utils/validationUtils';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailError) {
      // Later you will send data to Firebase here
      const userData = {
        email,
      };
      console.log('User Data to be sent to Firebase for password reset:', userData);

      // Reset fields after successful submission
      setEmail('');
    }
  };

  return (
    <BoxWrapper title="Forgot Password" maxWidth="lg">
      <form style={{ width: '100%', marginTop: 3 }} onSubmit={handleSubmit}>
        <InputBox 
          label="Email*" 
          type="email" 
          value={email}
          onChange={handleEmailChange}
        />
        {emailError && (
          <FormHelperText error>{emailError}</FormHelperText>
        )}
        <CustomButton title="Send Reset Link" type="submit" disabled={!!emailError} />
      </form>
    </BoxWrapper>
  );
};

export default ForgotPasswordPage;
