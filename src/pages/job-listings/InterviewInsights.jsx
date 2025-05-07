"use client"

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch, FaSort, FaBuilding, FaUser, FaMapMarkerAlt, FaStar, FaTrophy } from "react-icons/fa";
import "./InterviewInsights.css";

const InterviewInsights = () => {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState({ company: "", role: "" });
  const [sortBy, setSortBy] = useState("dateDesc");
  const [currentPage, setCurrentPage] = useState(1);
  const [experiencesPerPage] = useState(5);
  const [selectedExperience, setSelectedExperience] = useState(null);

  // Fetch interview experiences from backend
  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/interview-experiences`
        );
        setExperiences(response.data);
        setFilteredExperiences(response.data);
      } catch (err) {
        setError("Failed to load interview experiences.");
        console.error("Error fetching experiences:", err);
        toast.error("Failed to load interview experiences.");
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...experiences];

    // Filter by company and role
    if (searchQuery.company) {
      filtered = filtered.filter(exp =>
        exp.companyName.toLowerCase().includes(searchQuery.company.toLowerCase())
      );
    }
    if (searchQuery.role) {
      filtered = filtered.filter(exp =>
        exp.role.toLowerCase().includes(searchQuery.role.toLowerCase())
      );
    }

    // Sort experiences
    filtered.sort((a, b) => {
      if (sortBy === "dateDesc") {
        return new Date(b.postedDate) - new Date(a.postedDate);
      } else if (sortBy === "dateAsc") {
        return new Date(a.postedDate) - new Date(b.postedDate);
      } else if (sortBy === "companyAsc") {
        return a.companyName.localeCompare(b.companyName);
      } else if (sortBy === "companyDesc") {
        return b.companyName.localeCompare(a.companyName);
      }
      return 0;
    });

    setFilteredExperiences(filtered);
    setCurrentPage(1); // Reset to first page on filter/sort change
  }, [searchQuery, sortBy, experiences]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Pagination logic
  const indexOfLastExperience = currentPage * experiencesPerPage;
  const indexOfFirstExperience = indexOfLastExperience - experiencesPerPage;
  const currentExperiences = filteredExperiences.slice(
    indexOfFirstExperience,
    indexOfLastExperience
  );
  const totalPages = Math.ceil(filteredExperiences.length / experiencesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Handle card click to open modal
  const openModal = (experience) => {
    setSelectedExperience(experience);
  };

  // Close modal
  const closeModal = () => {
    setSelectedExperience(null);
  };

  return (
    <div className="interview-insights">
      

      {/* Search and Sort Controls */}
      <div className="search-sort-container">
      <NavLink to="/submit-interview-experience" className="submit-buttonShare">
        Share Your Experience
      </NavLink>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            name="company"
            placeholder="Search by company..."
            value={searchQuery.company}
            onChange={handleSearchChange}
          />
          <input
            type="text"
            name="role"
            placeholder="Search by role..."
            value={searchQuery.role}
            onChange={handleSearchChange}
          />
        </div>
        <div className="sort-container">
          <FaSort className="sort-icon" />
          <select value={sortBy} onChange={handleSortChange}>
            <option value="dateDesc">Newest First</option>
            <option value="dateAsc">Oldest First</option>
            <option value="companyAsc">Company A-Z</option>
            <option value="companyDesc">Company Z-A</option>
          </select>
        </div>
      </div>

      {/* Error and Loading States */}
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : filteredExperiences.length === 0 ? (
        <div className="no-experiences">No interview experiences found.</div>
      ) : (
        <>
          {/* Experience List */}
          <div className="experience-list">
            {currentExperiences.map((exp) => (
              <div
                key={exp._id}
                className="experience-card"
                onClick={() => openModal(exp)}
              >
                <div className="experience-header">
                  <h3>{`${exp.role} Interview`}</h3>
                  <p className="posted-date">{formatDate(exp.postedDate)}</p>
                </div>
                <div className="user-info">
                  <p><FaUser /> {exp.author} ({exp.course} {exp.batch})</p>
                  <p><FaMapMarkerAlt /> <strong>Location:</strong> {exp.interviewLocation}</p>
                </div>
                <div className="experience-meta">
                  <span className={`offer-status ${exp.offerStatus.toLowerCase()}`}>
                    {exp.offerStatus}
                  </span>
                  <span className={`experience-rating ${exp.experienceRating.toLowerCase()}`}>
                    {exp.experienceRating} Experience
                  </span>
                  <span className={`difficulty ${exp.difficulty.toLowerCase()}`}>
                    {exp.difficulty} Interview
                  </span>
                </div>
                <div className="experience-details">
                  <p><FaBuilding /> <strong>Company:</strong> {exp.companyName}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={currentPage === page ? "active" : ""}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal for Full Details */}
      {selectedExperience && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{`${selectedExperience.role} Interview`}</h2>
            <p className="posted-date">{formatDate(selectedExperience.postedDate)}</p>
            <div className="user-info">
              <p><FaUser /> {selectedExperience.author} ({selectedExperience.course} {selectedExperience.batch})</p>
              <p><FaMapMarkerAlt /> <strong>Location:</strong> {selectedExperience.interviewLocation}</p>
            </div>
            <div className="experience-meta">
              <span className={`offer-status ${selectedExperience.offerStatus.toLowerCase()}`}>
                {selectedExperience.offerStatus}
              </span>
              <span className={`experience-rating ${selectedExperience.experienceRating.toLowerCase()}`}>
                {selectedExperience.experienceRating} Experience
              </span>
              <span className={`difficulty ${selectedExperience.difficulty.toLowerCase()}`}>
                {selectedExperience.difficulty} Interview
              </span>
            </div>
            <div className="experience-details">
              <p><FaBuilding /> <strong>Company:</strong> {selectedExperience.companyName}</p>
              <p><strong>Role:</strong> {selectedExperience.role}</p>
              <p><strong>Total Rounds:</strong> {selectedExperience.rounds.length}</p>
            </div>
            <div className="experience-rounds">
              <h4>Interview Rounds:</h4>
              {selectedExperience.rounds.map((round, index) => (
                <div key={index} className="round">
                  <h5>Round {index + 1}: {round.name}</h5>
                  <p>{round.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewInsights;