import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./JobDescription.css";

const JobDescriptionPage = ({ job, onClose, onApply, isAdmin = false }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resume: null,
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/applications/my-applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Check if the current job._id exists in the list of applications
        const applied = response.data.some(app => app.jobId?._id === job._id);
        setHasApplied(applied);
      } catch (error) {
        console.error("Error checking application status:", error);
        toast.error("Failed to check application status. Please try again.");
      }
    };

    if (!isAdmin) {
      checkApplicationStatus();
    }
  }, [job._id, isAdmin]);

  const handleApplyClick = () => {
    setIsApplying(true);
    setSubmitStatus(null);
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleCloseApplyForm = () => {
    setIsApplying(false);
    setFormData({ fullName: "", email: "", phone: "", resume: null });
    setFormErrors({});
    setSubmitStatus(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      errors.phone = "Phone number must be 10 digits";
    if (!formData.resume) errors.resume = "Resume is required";
    else if (
      ![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(formData.resume.type)
    ) {
      errors.resume = "Resume must be PDF, DOC, or DOCX";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append("jobId", job._id);
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("resume", formData.resume);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/applications`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmitStatus("success");
      setHasApplied(true); // Update status after successful application
      toast.success(
        response.data.message || "Application submitted successfully!"
      );
      setTimeout(() => {
        handleCloseApplyForm();
        onApply?.();
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit application. Please try again.";
      setFormErrors({ general: errorMessage });
      setSubmitStatus("error");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-description-overlay">
      <div className="job-description__container">
        <button className="job-description__close-btn" onClick={onClose}>
          ×
        </button>

        <div className="job-description__header2">
          <h1 className="job-title-head2">{job.profiles}</h1>
          <div className="job-header-details2">
            <img
              src={job.companyLogo}
              alt="Company Logo"
              className="company-logo"
            />
            <div className="job-header-company2">
              <p className="company-name2">{job.companyName}</p>
              <p className="company-website2">
                <a href={job.website} target="_blank" rel="noreferrer">
                  Visit Website
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="jd-layout">
          <div className="job-description__details2">
            <div className="job-info2">
              <span>💸 CTC/Stipend:</span>
              <p>{job.ctcOrStipend}</p>
            </div>
            <div className="job-info2">
              <span>📌 Location:</span>
              <p>{job.location}</p>
            </div>
            <div className="job-info2">
              <span>🛠 Job Type:</span>
              <p>{job.offerType}</p>
            </div>
            <div className="job-info2">
              <span>📅 Vacancies:</span>
              <p>{job.vacancies}</p>
            </div>
          </div>
          <div className="job-description__details2">
            {job.reference && job.reference !== "Self" && (
              <div className="job-info2">
                <span>👤 Referred by:</span>
                <p>{job.reference}</p>
              </div>
            )}

            <div className="job-info2">
              <span>Category:</span>
              <p>{job.category.join(", ")}</p>
            </div>
            <div className="job-info2">
              <span>Starting date:</span>
              <p>{formatDate(job.dateOfJoining)}</p>
            </div>
          </div>
        </div>

        <div className="job-description__body2">
          <h2>Job Description</h2>
          <p>{job.jobDescription}</p>

          <h2>Eligibility Criteria</h2>
          <p>{job.eligibility}</p>

          <h2>Skills Required</h2>
          <div className="job-description__skills2">
            {job.skills &&
              job.skills.map((skill, index) => (
                <span key={index} className="job-description__skill-tag2">
                  {skill}
                </span>
              ))}
          </div>
        </div>

        {!isAdmin && (
          <div className="job-description__footer">
            {hasApplied ? (
              <button className="job-description__apply-btn" disabled>
                Already Applied
              </button>
            ) : (
              <button
                className="job-description__apply-btn"
                onClick={handleApplyClick}
              >
                Apply Now
              </button>
            )}
            <button
              className="job-description__close-details-btn"
              onClick={onClose}
            >
              Back to Job Listings
            </button>
          </div>
        )}
      </div>

      {isApplying && (
        <div className="apply-form-overlay">
          <div className="apply-form-container">
            <h2>Apply for {job.profiles}</h2>
            {submitStatus === "success" ? (
              <p className="success-msg">
                Application submitted successfully! 🎉
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.fullName && (
                    <p className="error-msg">{formErrors.fullName}</p>
                  )}
                </div>
                <div className="form-field">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="error-msg">{formErrors.email}</p>
                  )}
                </div>
                <div className="form-field">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.phone && (
                    <p className="error-msg">{formErrors.phone}</p>
                  )}
                </div>
                <div className="form-field">
                  <input
                    type="file"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                  {formErrors.resume && (
                    <p className="error-msg">{formErrors.resume}</p>
                  )}
                </div>
                {formErrors.general && (
                  <p className="error-msg">{formErrors.general}</p>
                )}
                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseApplyForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionPage;