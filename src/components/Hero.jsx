import React from "react";
import "./Hero.css";
import img1 from "../assets/hero-img.png";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();
  
  function handleJoin() {
    navigate('/authContainer');
  }
  
  function handlePost() {
    navigate('/post-job');
  }
  
  return (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-text">
          <h1>CampusConnect</h1>
          <h2>Bridging Talent & Opportunities</h2>
          <p>
            A smart, efficient platform connecting students with career opportunities, 
            internships, and industry insights.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary11" onClick={handleJoin}>
              Join Now
            </button>
            <button className="btn-secondary11" onClick={handlePost}>
              Post a Job
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src={img1 || "/placeholder.svg"} alt="Campus Connect" />
        </div>
      </div>
    </div>
  );
}

export default Hero;
