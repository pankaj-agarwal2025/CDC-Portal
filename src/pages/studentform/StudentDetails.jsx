import { useEffect, useState } from "react";
import axios from "axios";
import "./studentDetails.css";
import LoadingScreen from "../../components/LoadingScreen";
import { useNavigate } from "react-router-dom";
import Navbar from "../../layouts/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonalInfoSection from "./Personal";
import EducationSection from "./Education";
import SchoolInfoSection from "./SchoolInfo";
import SkillsSection from "./Skills";
import CertificationsSection from "./Certifications";
import ExperienceSection from "./Experience";
import UploadsSection from "./Uploads";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "../../redux/authSlice"; // Adjust path as needed

const StudentDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    rollNo: "",
    mobileNo: "",
    whatsappNo: "",
    mailId: "",
    fatherName: "",
    fatherNumber: "",
    education: {
      tenth: { percentage: "", passingYear: "" },
      twelfth: { percentage: "", passingYear: "" },
      graduation: { degree: "", percentageOrCGPA: "", passingYear: "" },
      masters: { degree: "", percentageOrCGPA: "", passingYear: "" },
    },
    school: "",
    existingBacklogs: "",
    areaOfInterest: "",
    skills: [],
    hasCertifications: false,
    certifications: [],
    readyToRelocate: false,
    experience: [
      {
        hasExperience: false,
        organizationName: "",
        duration: "",
        details: "",
      },
    ],
    resume: null,
    profilePhoto: null,
  });

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem("token")) {
      navigate("/auth-Container");
      return;
    }

    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }
        const res = await axios.get(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        const userData = res.data || {};
        const profilePhotoUrl = userData.profilePhoto
  ? userData.profilePhoto.startsWith("http")
    ? userData.profilePhoto
    : `${API_URL.replace(/\/$/, "")}/${userData.profilePhoto.replace(/^\/?api\//, "")}`
  : null;


        setFormData((prev) => ({
          ...prev,
          ...userData,
          profilePhoto: profilePhotoUrl,
          education: userData.education || prev.education,
          experience: Array.isArray(userData.experience) && userData.experience.length > 0
            ? userData.experience
            : prev.experience,
          hasCertifications: Array.isArray(userData.certifications) && userData.certifications.length > 0,
          certifications: userData.certifications || [],
          skills: userData.skills || [],
        }));
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error(error.message || "Failed to load your profile");
        if (error.response?.status === 401) {
          navigate("/auth-Container");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [API_URL, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      handleFileInputChange(name, files);
    } else if (type === "checkbox") {
      handleCheckboxChange(name, checked);
    } else if (name.startsWith("education")) {
      handleEducationChange(name, value);
    } else if (name.startsWith("experience")) {
      handleExperienceChange(name, value);
    } else if (name.startsWith("certification")) {
      handleCertificationChange(name, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileInputChange = (name, files) => {
    if (name.startsWith("certificationImage")) {
      const index = parseInt(name.split("-")[1]);
      const updatedCertifications = [...formData.certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        image: files[0],
      };
      setFormData((prev) => ({
        ...prev,
        certifications: updatedCertifications,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCheckboxChange = (name, checked) => {
    if (name === "hasCertifications") {
      setFormData((prev) => ({
        ...prev,
        hasCertifications: checked,
        certifications: checked ? [...prev.certifications] : [],
      }));
    } else if (name === "hasExperience") {
      const updatedExperience = [...formData.experience];
      updatedExperience[0] = { ...updatedExperience[0], hasExperience: checked };
      setFormData((prev) => ({
        ...prev,
        experience: updatedExperience,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
  };

  const handleEducationChange = (name, value) => {
    const keys = name.split(".");
    setFormData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [keys[1]]: { ...prev.education[keys[1]], [keys[2]]: value },
      },
    }));
  };

  const handleCertificationChange = (name, value) => {
    const [field, index] = name.split("-");
    const updatedCertifications = [...formData.certifications];
    if (!updatedCertifications[parseInt(index)]) {
      updatedCertifications[parseInt(index)] = { name: "", image: null };
    }
    updatedCertifications[parseInt(index)] = {
      ...updatedCertifications[parseInt(index)],
      name: value,
    };
    setFormData((prev) => ({
      ...prev,
      certifications: updatedCertifications,
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "" }],
    }));
  };

  const removeSkill = (index) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...formData.skills];
    if (!updatedSkills[index]) {
      updatedSkills[index] = { name: "" };
    }
    if (updatedSkills[index]._id) {
      updatedSkills[index] = { ...updatedSkills[index], name: value };
    } else {
      updatedSkills[index] = { name: value };
    }
    setFormData((prev) => ({
      ...prev,
      skills: updatedSkills,
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", image: null }],
    }));
  };

  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      certifications: updatedCertifications,
    }));
  };

  const validateForm = () => {
    const mobileRegex = /^\d{10}$/;
    if (formData.mobileNo && !mobileRegex.test(formData.mobileNo)) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }
    if (formData.whatsappNo && !mobileRegex.test(formData.whatsappNo)) {
      toast.error("WhatsApp number must be 10 digits");
      return false;
    }
    if (formData.fatherNumber && !mobileRegex.test(formData.fatherNumber)) {
      toast.error("Father's number must be 10 digits");
      return false;
    }
    const percentageFields = [
      { name: "10th percentage", value: formData.education.tenth.percentage },
      { name: "12th percentage", value: formData.education.twelfth.percentage },
    ];
    for (const field of percentageFields) {
      if (field.value) {
        const percentage = parseFloat(field.value);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          toast.error(`${field.name} must be a number between 0 and 100`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "education") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === "experience") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === "certifications") {
        formDataToSend.append(
          key,
          JSON.stringify(
            formData.certifications.map((cert) => ({
              name: cert.name,
              image: typeof cert.image === "string" ? cert.image : null,
            }))
          )
        );
        formData.certifications.forEach((cert, index) => {
          if (cert.image && typeof cert.image !== "string") {
            formDataToSend.append(`certificationImage-${index}`, cert.image);
          }
        });
      } else if (key === "skills") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === "profilePhoto" && formData[key] instanceof File) {
        formDataToSend.append(key, formData[key]);
      } else if (key === "resume" && formData[key] instanceof File) {
        formDataToSend.append(key, formData[key]);
      } else if (key !== "hasCertifications") {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      if (user && user.role) {
        localStorage.setItem("role", user.role);
      }
      const response = await axios.post(`${API_URL}/profile/update`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully!");
      navigate("/dashboard", { replace: true });
      dispatch(fetchUser());
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please auth-Container again.");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/auth-Container");
      } else {
        toast.error(error.response?.data?.message || "Error updating profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperiences = [...formData.experience];
    if (index >= updatedExperiences.length) {
      console.warn(`Index ${index} out of bounds for experience array`);
      return;
    }
    if (!updatedExperiences[index]) {
      updatedExperiences[index] = {
        hasExperience: true,
        organizationName: "",
        duration: "",
        details: "",
      };
    }
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      experience: updatedExperiences,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          hasExperience: true,
          organizationName: "",
          duration: "",
          details: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    if (formData.experience.length <= 1) {
      return;
    }
    const updatedExperiences = [...formData.experience];
    updatedExperiences.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      experience: updatedExperiences,
    }));
  };

  return (
    <>
      <Navbar />
      <div className="student-form-container">
        {loading && <LoadingScreen />}
        <h2 className="form-title">Complete Your Details</h2>
        <form className="student-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-column">
              <PersonalInfoSection formData={formData} handleChange={handleChange} />
              <div className="form-group">
                <label>Area of Interest</label>
                <input
                  type="text"
                  name="areaOfInterest"
                  value={formData.areaOfInterest}
                  onChange={handleChange}
                  required
                />
              </div>
              <SkillsSection
                skills={formData.skills}
                handleSkillChange={handleSkillChange}
                addSkill={addSkill}
                removeSkill={removeSkill}
              />
            </div>
            <div className="form-column">
              <EducationSection formData={formData} handleChange={handleChange} />
              <SchoolInfoSection formData={formData} handleChange={handleChange} />
            </div>
          </div>
          <div className="form-section">
            <CertificationsSection
              hasCertifications={formData.hasCertifications}
              certifications={formData.certifications}
              handleChange={handleChange}
              addCertification={addCertification}
              removeCertification={removeCertification}
            />
            <div className="form-group">
              <label>Whether ready to work across India?</label>
              <div className="checkbox-container">
                <label htmlFor="readyToRelocate">Yes</label>
                <input
                  type="checkbox"
                  name="readyToRelocate"
                  checked={formData.readyToRelocate}
                  onChange={handleChange}
                  id="readyToRelocate"
                />
              </div>
            </div>
            <ExperienceSection
              experiences={formData.experience}
              handleChange={handleExperienceChange}
              addExperience={addExperience}
              removeExperience={removeExperience}
            />
          </div>
          <UploadsSection formData={formData} handleChange={handleChange} API_URL={API_URL} />
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
};

export default StudentDetails;