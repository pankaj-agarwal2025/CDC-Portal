import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SubmitInterviewExperience.css";

const SubmitInterviewExperience = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    role: "",
    author: "",
    batch: "",
    course: "",
    interviewLocation: "",
    offerStatus: "No Offer",
    experienceRating: "Neutral",
    difficulty: "Medium",
    rounds: [{ name: "", description: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoundChange = (index, e) => {
    const { name, value } = e.target;
    const rounds = [...formData.rounds];
    rounds[index] = { ...rounds[index], [name]: value };
    setFormData((prev) => ({ ...prev, rounds }));
  };

  const addRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [...prev.rounds, { name: "", description: "" }],
    }));
  };

  const removeRound = (index) => {
    setFormData((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interview-experiences`,
        formData
      );
      toast.success("Interview experience submitted successfully!");
      setFormData({
        companyName: "",
        role: "",
        author: "",
        batch: "",
        course: "",
        interviewLocation: "",
        offerStatus: "No Offer",
        experienceRating: "Neutral",
        difficulty: "Medium",
        rounds: [{ name: "", description: "" }],
      });
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error(error.response?.data?.message || "Failed to submit experience.");
    }
  };

  return (
    <div className="submit-interview-experience">
      <h1>Share Your Interview Experience</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            placeholder="e.g., Google"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            placeholder="e.g., Software Engineer"
          />
        </div>
        <div className="form-group">
          <label htmlFor="author">Your Name</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            placeholder="e.g., Khushnam Chauhan"
          />
        </div>
        <div className="form-group">
          <label htmlFor="batch">Batch</label>
          <input
            type="text"
            id="batch"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            required
            placeholder="e.g., 2023-2025"
          />
        </div>
        <div className="form-group">
          <label htmlFor="course">Course</label>
          <input
            type="text"
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            placeholder="e.g., MCA"
          />
        </div>
        <div className="form-group">
          <label htmlFor="interviewLocation">Interview Location</label>
          <input
            type="text"
            id="interviewLocation"
            name="interviewLocation"
            value={formData.interviewLocation}
            onChange={handleChange}
            required
            placeholder="e.g., Campus"
          />
        </div>
        <div className="form-group">
          <label htmlFor="offerStatus">Offer Status</label>
          <select
            id="offerStatus"
            name="offerStatus"
            value={formData.offerStatus}
            onChange={handleChange}
            required
          >
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="No Offer">No Offer</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="experienceRating">Experience Rating</label>
          <select
            id="experienceRating"
            name="experienceRating"
            value={formData.experienceRating}
            onChange={handleChange}
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
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div className="rounds-section">
          <h3>Interview Rounds</h3>
          {formData.rounds.map((round, index) => (
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
                  placeholder="e.g., Technical Interview"
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
                  placeholder="Describe the round in detail..."
                />
              </div>
              {formData.rounds.length > 1 && (
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
        <button type="submit" className="submit-button">
          Submit Experience
        </button>
      </form>
    </div>
  );
};

export default SubmitInterviewExperience;