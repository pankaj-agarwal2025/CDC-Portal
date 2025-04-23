import React, { useState } from "react";
import "./auth.css";
import Login from "./Login";
import Signup from "./Register";
import Navbar from "../../layouts/Navbar";

const AuthContainer = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Sign Up
            </button>
          </div>
          
          <div className="auth-form-container">
            {activeTab === "login" ? (
              <>
                <h1 className="auth-title">Welcome Back</h1>
                <Login />
                <div className="auth-extra">
                  Don't have an account?{" "}
                  <button 
                    className="auth-link" 
                    onClick={() => setActiveTab("signup")}
                  >
                    Create one now
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="auth-title">Create Account</h1>
                <Signup />
                <div className="auth-extra">
                  Already have an account?{" "}
                  <button 
                    className="auth-link" 
                    onClick={() => setActiveTab("login")}
                  >
                    Login here
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthContainer;