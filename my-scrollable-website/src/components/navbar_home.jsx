import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar_home.css'; // Adjust the path to match the correct directory

const HomeNavbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Landing Page</Link>
      <Link to="/signup" className="nav-link">Sign Up</Link>
      <Link to="/signin" className="nav-link">Sign In</Link>
      <Link to="/create-service" className="nav-link">Create Service</Link>
      <Link to="/service" className="nav-link">Service</Link>
    </nav>
  );
};

export default HomeNavbar;
