// src/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
import CreateServicePage from './pages/CreateServicePage';
import ServicePage from './pages/ServicePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import ProfilePage from './pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-service" element={<CreateServicePage />} />
        <Route path="/services/:serviceId" element={<ServicePage />} />
        <Route path="/profile/:userId" element={<ProfilePage/>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
