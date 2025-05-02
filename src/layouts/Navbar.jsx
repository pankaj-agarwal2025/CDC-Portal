import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };
  
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Campus <span className="nav-color2">Connect</span> 
        </Link>
        
        {/* Hamburger Icon */}
        <div className="menu-icon" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Navigation Links */}
        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {!isLoggedIn && (
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
          )}
          
          {isLoggedIn && (
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
          )}
          
          <li className="nav-item">
            {isLoggedIn ? (
              <button className="nav-button logout1" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <Link to="/authContainer" className="nav-button login">
                Sign In
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
