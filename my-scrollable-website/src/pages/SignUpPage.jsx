// pages/SignUpPage.jsx
// import React, { useState } from "react";
// import { auth } from "../firebase";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { Link, useNavigate } from "react-router-dom";

// const Signup = () => {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [notice, setNotice] = useState("");

//     const signupWithUsernameAndPassword = async (e) => {
//         e.preventDefault();

//         if (password === confirmPassword) {
//             try {
//                 await createUserWithEmailAndPassword(auth, email, password);
//                 navigate("/");
//             } catch {
//                 setNotice("Sorry, something went wrong. Please try again.");
//             }     
//         } else {
//             setNotice("Passwords don't match. Please try again.");
//         }
//     };

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
//                         <input id = "signupEmail" type = "email" className = "form-control" aria-describedby = "emailHelp" placeholder = "name@example.com" value = { email } onChange = { (e) => setEmail(e.target.value) }></input>
//                         <label htmlFor = "signupEmail" className = "form-label">Enter an email address for your username</label>
//                     </div>
//                     <div className = "form-floating mb-3">
//                         <input id = "signupPassword" type = "password" className = "form-control" placeholder = "Password" value = { password } onChange = { (e) => setPassword(e.target.value) }></input>
//                         <label htmlFor = "signupPassword" className = "form-label">Password</label>
//                     </div>
//                     <div className = "form-floating mb-3">
//                         <input id = "confirmPassword" type = "password" className = "form-control" placeholder = "Confirm Password" value = { confirmPassword } onChange = { (e) => setConfirmPassword(e.target.value) }></input>
//                         <label htmlFor = "confirmPassword" className = "form-label">Confirm Password</label>
//                     </div>                    
//                     <div className = "d-grid">
//                         <button type = "submit" className = "btn btn-primary pt-3 pb-3" onClick = {(e) => signupWithUsernameAndPassword(e)}>Signup</button>
//                     </div>
//                     <div className = "mt-3 text-center">
//                         <span>Go back to login? <Link to = "/">Click here.</Link></span>
//                     </div>                    
//                 </form>
//             </div>
//         </div>
//     )
// }

// export default Signup


// path = my-scrollable-website/my-scrollable-website/src/pages/SignUpPage.jsx
import React, { useState } from 'react';
import { FormHelperText } from '@mui/material';
import InputBox from '../components/InputBox';
import CustomButton from '../components/custom_button';
import BoxWrapper from '../components/BoxWrapper';
import { validatePassword, validateEmail } from '../utils/validationUtils';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Ensure these are imported correctly


const SignUpPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [fullName, setFullName] = useState(''); // State for Full Name
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleFullNameChange = (e) => {
    setFullName(e.target.value); // Update fullName state
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(validateEmail(newEmail));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordError && !emailError) {
      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user's profile information in Firestore
        await setDoc(doc(db, "profiles", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: user.email,
          createdAt: new Date().toISOString(),
        });

        console.log('User Data stored in Firestore:', {
          uid: user.uid,
          fullName,
          email,
        });

        // Navigate to home or another page after successful signup
        navigate("/"); // Corrected to use navigate

        // Reset fields after successful submission
        setFullName('');
        setPassword('');
        setEmail('');
      } catch (error) {
        console.log("Sorry, something went wrong. Please try again.", error);
      }
    }
  };

  return (
    <BoxWrapper title="Register" maxWidth="lg">
      <form style={{ width: '100%', marginTop: 3 }} onSubmit={handleSubmit}>
        <InputBox 
          label="Full Name*" 
          type="text" 
          value={fullName} 
          onChange={handleFullNameChange} // Handle fullName input change
        />
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
        <CustomButton title="Sign Up" type="submit" disabled={!!passwordError || !!emailError} />
      </form>
    </BoxWrapper>
  );
};

export default SignUpPage;
