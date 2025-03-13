import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Import styles
import logo from "../assets/logo.png"; // Adjust the path if needed

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Nirlogi Solutions Logo" className="logo" />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
      </div>
    </nav>
  );
};

export default Navbar;
