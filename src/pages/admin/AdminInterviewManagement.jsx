import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import "./AdminInterviewManagement.css";

const AdminInterviewManagement = ({
  fetchInterviewExperiences,
  deleteInterviewExperience,
}) => {
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Fetch experiences on mount
  useEffect(() => {
    const loadExperiences = async () => {
      setLoading(true);
      try {
        const data = await fetchInterviewExperiences();
        setExperiences(data);
        setFilteredExperiences(data);
        setError(null);
      } catch (err) {
        setError("Failed to load interview experiences.");
        console.error("Error fetching experiences:", err);
      } finally {
        setLoading(false);
      }
    };
    loadExperiences();
  }, [fetchInterviewExperiences]);

  // Handle search
  useEffect(() => {
    const filtered = experiences.filter((exp) =>
      exp.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExperiences(filtered);
  }, [searchQuery, experiences]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Open modal with selected experience
  const openModal = (experience) => {
    setSelectedExperience(experience);
    setEditFormData({
      companyName: experience.companyName,
      role: experience.role,
      author: experience.author,
      batch: experience.batch,
      course: experience.course,
      interviewLocation: experience.interviewLocation,
      offerStatus: experience.offerStatus,
      experienceRating: experience.experienceRating,
      difficulty: experience.difficulty,
      rounds: experience.rounds.map((round) => ({ ...round })),
    });
    setIsEditing(false);
  };

  // Close modal
  const closeModal = () => {
    setSelectedExperience(null);
    setIsEditing(false);
    setEditFormData(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await deleteInterviewExperience(id);
        setExperiences(experiences.filter((exp) => exp._id !== id));
        setFilteredExperiences(filteredExperiences.filter((exp) => exp._id !== id));
        if (selectedExperience && selectedExperience._id === id) {
          closeModal();
        }
        toast.success("Interview experience deleted successfully.");
      } catch (err) {
        setError("Failed to delete experience.");
        console.error("Error deleting experience:", err);
        toast.error("Failed to delete experience.");
      }
    }
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle round change in edit form
  const handleRoundChange = (index, e) => {
    const { name, value } = e.target;
    const rounds = [...editFormData.rounds];
    rounds[index] = { ...rounds[index], [name]: value };
    setEditFormData((prev) => ({ ...prev, rounds }));
  };

  // Add round in edit form
  const addRound = () => {
    setEditFormData((prev) => ({
      ...prev,
      rounds: [...prev.rounds, { name: "", description: "" }],
    }));
  };

  // Remove round in edit form
  const removeRound = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index),
    }));
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/interview-experiences/${selectedExperience._id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const updatedExperience = response.data.experience;
      setExperiences(experiences.map((exp) =>
        exp._id === updatedExperience._id ? updatedExperience : exp
      ));
      setFilteredExperiences(filteredExperiences.map((exp) =>
        exp._id === updatedExperience._id ? updatedExperience : exp
      ));
      setSelectedExperience(updatedExperience);
      setIsEditing(false);
      toast.success("Interview experience updated successfully.");
    } catch (err) {
      console.error("Error updating experience:", err);
      toast.error(err.response?.data?.message || "Failed to update experience.");
    }
  };

  return (
    <div className="admin-interview-management">
      <h2>Manage Interview Experiences</h2>
      {/* Search Bar and Add Experience Button */}
      <div className="search-bar-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by company, role, or author..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <NavLink to="/submit-interview-experience" className="add-experience-button">
          Add Experience
        </NavLink>
      </div>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : filteredExperiences.length === 0 ? (
        <div className="no-experiences">No interview experiences found.</div>
      ) : (
        <div className="experience-list">
          {filteredExperiences.map((exp) => (
            <div
              key={exp._id}
              className="experience-card"
              onClick={() => openModal(exp)}
            >
              <div className="experience-header">
                <h3>{exp.companyName} - {exp.role}</h3>
                <p>Posted: {formatDate(exp.postedDate)}</p>
              </div>
              <div className="experience-details">
                <p><strong>Author:</strong> {exp.author}</p>
                <p><strong>Offer Status:</strong> {exp.offerStatus}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Full Details or Editing */}
      {selectedExperience && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <h2>Edit Interview Experience</h2>
                <div className="form-group">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={editFormData.companyName}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="author">Author</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={editFormData.author}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="batch">Batch</label>
                  <input
                    type="text"
                    id="batch"
                    name="batch"
                    value={editFormData.batch}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="course">Course</label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={editFormData.course}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interviewLocation">Interview Location</label>
                  <input
                    type="text"
                    id="interviewLocation"
                    name="interviewLocation"
                    value={editFormData.interviewLocation}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="offerStatus">Offer Status</label>
                  <select
                    id="offerStatus"
                    name="offerStatus"
                    value={editFormData.offerStatus}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Accepted">Accepted</option>
                    <option value="Declined">Declined</option>
                    <option value="No Selected">No Selected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="experienceRating">Experience Rating</label>
                  <select
                    id="experienceRating"
                    name="experienceRating"
                    value={editFormData.experienceRating}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Amazing">Amazing</option>
                    <option value="Neutral">Neutral</option>
                    <option value="Bad">Bad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    value={editFormData.difficulty}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="rounds-section">
                  <h3>Interview Rounds</h3>
                  {editFormData.rounds.map((round, index) => (
                    <div key={index} className="round-group">
                      <div className="form-group">
                        <label htmlFor={`round-name-${index}`}>Round Name</label>
                        <input
                          type="text"
                          id={`round-name-${index}`}
                          name="name"
                          value={round.name}
                          onChange={(e) => handleRoundChange(index, e)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`round-description-${index}`}>Description</label>
                        <textarea
                          id={`round-description-${index}`}
                          name="description"
                          value={round.description}
                          onChange={(e) => handleRoundChange(index, e)}
                          required
                        />
                      </div>
                      {editFormData.rounds.length > 1 && (
                        <button
                          type="button"
                          className="remove-round"
                          onClick={() => removeRound(index)}
                        >
                          Remove Round
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="add-round" onClick={addRound}>
                    Add Round
                  </button>
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2>{selectedExperience.companyName} - {selectedExperience.role}</h2>
                <p>Posted: {formatDate(selectedExperience.postedDate)}</p>
                <div className="experience-details">
                  <p><strong>Author:</strong> {selectedExperience.author} ({selectedExperience.course} {selectedExperience.batch})</p>
                  <p><strong>Location:</strong> {selectedExperience.interviewLocation}</p>
                  <p><strong>Offer Status:</strong> {selectedExperience.offerStatus}</p>
                  <p><strong>Experience Rating:</strong> {selectedExperience.experienceRating}</p>
                  <p><strong>Difficulty:</strong> {selectedExperience.difficulty}</p>
                  <p><strong>Rounds:</strong> {selectedExperience.rounds.length}</p>
                </div>
                <div className="experience-rounds">
                  <h4>Rounds:</h4>
                  {selectedExperience.rounds.map((round, index) => (
                    <div key={index} className="round">
                      <h5>Round {index + 1}: {round.name}</h5>
                      <p>{round.description}</p>
                    </div>
                  ))}
                </div>
                <div className="action-buttons">
                  <button
                    className="edit-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(selectedExperience._id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviewManagement;