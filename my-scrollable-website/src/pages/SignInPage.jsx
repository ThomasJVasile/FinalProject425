// // src/pages/SignInPage.jsx
// import React from 'react';



// import { useState } from "react";
// import { auth } from "../firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { Link, useNavigate } from "react-router-dom";

// const Login = () => {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [notice, setNotice] = useState("");

//     const loginWithUsernameAndPassword = async (e) => {
//         e.preventDefault();

//         try {
//             await signInWithEmailAndPassword(auth, email, password);
//             navigate("./profile");
//         } catch {
//             setNotice("You entered a wrong username or password.");
//         }
//     }

//     return(
//         <div className = "container">
//             <div className = "row justify-content-center">
//                 <form className = "col-md-4 mt-3 pt-3 pb-3">
//                     { "" !== notice &&
//                         <div className = "alert alert-warning" role = "alert">
//                             { notice }    
//                         </div>
//                     }                  
//                     <div className = "form-floating mb-3">
//                         <input type = "email" className = "form-control" id = "exampleInputEmail1" aria-describedby = "emailHelp" placeholder = "name@example.com" value = { email } onChange = { (e) => setEmail(e.target.value) }></input>
//                         <label htmlFor = "exampleInputEmail1" className = "form-label">Email address</label>
//                     </div>
//                     <div className = "form-floating mb-3">
//                         <input type = "password" className = "form-control" id = "exampleInputPassword1" placeholder = "Password" value = { password } onChange = { (e) => setPassword(e.target.value) }></input>
//                         <label htmlFor = "exampleInputPassword1" className = "form-label">Password</label>
//                     </div>
//                     <div className = "d-grid">
//                         <button type = "submit" className = "btn btn-primary pt-3 pb-3" onClick = {(e) => loginWithUsernameAndPassword(e)}>Submit</button>
//                     </div>
//                     <div className = "mt-3 text-center">
//                         <span>Need to sign up for an account? <Link to = "./signup">Click here.</Link></span>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     )
// }

// export default Login
// // const SignInPage = () => {
// //   return (
// //     <div>
// //       <h1>Sign In Page</h1>
// //       {/* Your sign-in form goes here */}
// //     </div>
// //   );
// // };

// // export default SignInPage;

// src/pages/SignInPage.jsx
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import Link from react-router-dom
import { Link, FormHelperText, Box } from '@mui/material';
import InputBox from '../components/InputBox';
import CustomButton from '../components/custom_button';
import BoxWrapper from '../components/BoxWrapper';
import { validatePassword, validateEmail } from '../utils/validationUtils';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const SignInPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!passwordError && !emailError) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the userId from the signed-in user

      // Navigate to the profile page with the userId
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.log("Sorry, something went wrong. Please try again.", error);
    }      

    // Reset fields after successful submission
    setEmail('');
    setPassword('');
  }
};

  return (
    <BoxWrapper title="Sign In" maxWidth="lg">
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
        <InputBox 
          label="Password*" 
          type="password" 
          value={password}
          onChange={handlePasswordChange}
        />
        {passwordError && (
          <FormHelperText error>{passwordError}</FormHelperText>
        )}
        <CustomButton title="Sign In" type="submit" disabled={!!passwordError || !!emailError} />
        <Box sx={{ mt: 2 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Forgot Password? Click here
          </Link>
        </Box>
      </form>
    </BoxWrapper>
  );
};

export default SignInPage;
