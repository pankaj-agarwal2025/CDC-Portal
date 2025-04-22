import React from "react";

const UploadsSection = ({ formData, handleChange, API_URL }) => {
  const getImageUrl = (fileData) => {
    if (!fileData) return null;
  
    // If it's already a URL (containing http), we need to parse and fix it
    if (typeof fileData === "string") {
      if (fileData.startsWith("http")) {
        // Fix the URL if it has a double slash issue
        return fileData.replace('/api//', '/api/');
      }
      
      // For paths like "/uploads/filename"
      const cleanPath = fileData.replace(/^\//, '');
      return `${API_URL.replace(/\/$/, '')}/${cleanPath}`;
    }
  
    return URL.createObjectURL(fileData);
  };
  

  return (
    <div className="profile-upload-section1">
      <div className="profile-photo-container11">
        <div className="profile-photo-preview1">
          {formData.profilePhoto ? (
            <img
              src={getImageUrl(formData.profilePhoto)}
              alt="Profile Preview"
              onError={(e) => console.error("Failed to load profile photo:", e.target.src)}
            />
          ) : (
            <div className="profile-placeholder1">
              <span>+</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="upload-btn"
          onClick={() => document.getElementById("profilePhotoInput").click()}
        >
          Upload Profile
        </button>
        <input
          id="profilePhotoInput"
          type="file"
          name="profilePhoto"
          onChange={handleChange}
          accept="image/*"
          style={{ display: "none" }}
        />
      </div>

      <div className="resume-upload-container11">
        <div className="resume-preview1">
          {formData.resume ? (
            <div className="resume-uploaded1">
              <span>Resume Uploaded</span>
            </div>
          ) : (
            <div className="resume-placeholder1">
              <span>+</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className="upload-btn"
          onClick={() => document.getElementById("resumeInput").click()}
        >
          Upload Resume
        </button>
        <input
          id="resumeInput"
          type="file"
          name="resume"
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default UploadsSection;