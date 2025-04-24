import React from "react";
import Navbar from "../layouts/Navbar";
import khushnamPhoto from "../assets/khush.jpg";
import apoorvaPhoto from "../assets/apoorva.jpg"; 
import './About.css'
function About() {
  // Prevent right-click and drag on images
  const preventImageInteraction = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <Navbar />
      <div className="about-container">
        <div className="about-header">
          <h1>About CampusConnect</h1>
          <p className="header-subtitle">
            Empowering Students, Streamlining Opportunities
          </p>
        </div>

        <div className="about-content">
          <section className="platform-overview">
            <h2>Our Mission</h2>
            <p>
              <strong>CampusConnect</strong> is a platform developed for the
              Career Development Centre (CDC) of <strong>K.R. Mangalam University</strong>. 
              We bridge the gap between students, the CDC, and recruiters, empowering 
              students with seamless access to opportunities while making the CDC's 
              operations more efficient and transparent.
            </p>
          </section>

          <section className="platform-features">
            <h2>What We Offer</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">📋</div>
                <p><strong>Job Listings & Applications</strong></p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <p><strong>Application Tracking</strong></p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎓</div>
                <p><strong>CDC Events</strong></p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📝</div>
                <p><strong>Resume Insights</strong></p>
              </div>
            </div>
          </section>

          <section className="about-team">
            <h2>Meet the Developers</h2>
            <div className="team-grid">
              <div className="developer-card">
                <div className="developer-photo-wrapper">
                  <img
                    src={khushnamPhoto}
                    alt="Khushnam Chauhan"
                    className="developer-photo"
                    onContextMenu={preventImageInteraction}
                    onDragStart={preventImageInteraction}
                  />
                </div>
                <div className="developer-info">
                  <h3>Khushnam Chauhan</h3>
                  <p className="developer-role">Full-Stack Developer</p>
                  <p className="developer-bio">
                    Khushnam Chauhan, a student of MCA (Batch 2023-25) at K.R. Mangalam University,
                    is the mastermind behind CampusConnect's development. He designed and developed the platform's
                    intuitive interface and dynamic features, ensuring a seamless experience for all users.
                  </p>
                  <div className="developer-contact">
                    <a
                      href="https://www.linkedin.com/in/khushnam-chauhan-58b25a2a5/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link linkedin"
                    >
                      <i className="fab fa-linkedin"></i> LinkedIn
                    </a>
                    <a
                      href="mailto:chauhankhushnam@gmail.com"
                      className="contact-link email"
                    >
                      <i className="fas fa-envelope"></i> Email
                    </a>
                  </div>
                </div>
              </div>

              <div className="developer-card">
                <div className="developer-photo-wrapper">
                  <img
                    src={apoorvaPhoto}
                    alt="Apoorva Sharma"
                    className="developer-photo"
                    onContextMenu={preventImageInteraction}
                    onDragStart={preventImageInteraction}
                  />
                </div>
                <div className="developer-info">
                  <h3>Apoorva Sharma</h3>
                  <p className="developer-role">Project Analyst & AI Specialist</p>
                  <p className="developer-bio">
                    Apoorva Sharma, also from MCA (Batch 2023-25), analyzed the requirements and helped
                    create the architecture for CampusConnect. She developed the Resume Insights feature 
                    and contributed to the data modeling and workflow optimization across the platform.
                  </p>
                  <div className="developer-contact">
                    <a
                      href="https://www.linkedin.com/in/apoorva-sharma-226861166/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link linkedin"
                    >
                      <i className="fab fa-linkedin"></i> LinkedIn
                    </a>
                    <a
                      href="mailto:apoorva.sharma651@gmail.com"
                      className="contact-link email"
                    >
                      <i className="fas fa-envelope"></i> Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="project-support">
            <h2>Project Support</h2>
            <p>
              CampusConnect was developed under the guidance of the Dr. Pankaj Agarwal (Dean SOET) 
              at K.R. Mangalam University. We extend our gratitude to the Dr. Pankaj Agarwal , Dr. Vibha Thakur and the 
              Career Development Centre for their valuable feedback and support throughout the development process.
            </p>
            <div className="contact-info">
              <p>For inquiries about CampusConnect, please contact:</p>
              <p><strong>Email:</strong> soet.krmu.2013@gmail.com</p>
              <p><strong>CDC Office:</strong> A Block, K.R. Mangalam University</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default About;