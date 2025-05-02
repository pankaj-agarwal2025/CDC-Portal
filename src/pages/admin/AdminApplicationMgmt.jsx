import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "./AdminApplicationManagement.css";

const AdminApplicationManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedApps, setSelectedApps] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "appliedDate", direction: "desc" });
  const [modalApp, setModalApp] = useState(null);
  const [bulkStatus, setBulkStatus] = useState("");
  const [exportStatusFilter, setExportStatusFilter] = useState("");
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/applications/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load jobs: " + (err.response?.data?.message || err.message));
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async (jobId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/applications/applications/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(Array.isArray(response.data) ? response.data : []);
      setSelectedJob(jobs.find(job => job._id === jobId));
      setSelectedApps([]);
      setBulkStatus("");
      setExportStatusFilter("");
      setError(null);
    } catch (err) {
      setError("Failed to load applications: " + (err.response?.data?.message || err.message));
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/applications/applications/${appId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(applications.map(app => (app._id === appId ? response.data : app)));
      if (modalApp && modalApp._id === appId) setModalApp(response.data);
      setSuccessMessage(`Status updated to ${newStatus}. Email sent to applicant.`);
      toast.success(`Status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Failed to update status to ${newStatus}: ${err.response?.data?.message || err.message}`);
      toast.error("Failed to update status.");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      setError("Please select a status to apply.");
      toast.error("Please select a status.");
      return;
    }
    if (selectedApps.length === 0) {
      setError("Please select at least one application.");
      toast.error("Please select at least one application.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const updates = selectedApps.map(id =>
        axios.put(
          `${API_URL}/applications/applications/${id}`,
          { status: bulkStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      const responses = await Promise.all(updates);
      const updatedApps = responses.map(res => res.data);
      setApplications(applications.map(app =>
        selectedApps.includes(app._id) ? updatedApps.find(u => u._id === app._id) || app : app
      ));
      if (modalApp && selectedApps.includes(modalApp._id)) {
        const updatedModalApp = updatedApps.find(u => u._id === modalApp._id);
        if (updatedModalApp) setModalApp(updatedModalApp);
      }
      setSelectedApps([]);
      setBulkStatus("");
      setSuccessMessage(`${selectedApps.length} application(s) updated to ${bulkStatus}.`);
      toast.success(`${selectedApps.length} application(s) updated to ${bulkStatus}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update some statuses: " + (err.response?.data?.message || err.message));
      toast.error("Failed to update some statuses.");
    }
  };

  const handleDeleteApp = async (appId) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/applications/applications/${appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(applications.filter(app => app._id !== appId));
        setSelectedApps(selectedApps.filter(id => id !== appId));
        if (modalApp && modalApp._id === appId) setModalApp(null);
        setJobs(jobs.map(job =>
          job._id === selectedJob._id ? { ...job, applicationCount: job.applicationCount - 1 } : job
        ));
        setSuccessMessage("Application deleted successfully.");
        toast.success("Application deleted successfully.");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError("Failed to delete application: " + (err.response?.data?.message || err.message));
        toast.error("Failed to delete application.");
      }
    }
  };

  const handleSelectApp = (appId) => {
    setSelectedApps(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    setSelectedApps(selectedApps.length === applications.length ? [] : applications.map(app => app._id));
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedApps.length} applications?`)) {
      try {
        const token = localStorage.getItem("token");
        await Promise.all(
          selectedApps.map(id =>
            axios.delete(`${API_URL}/applications/applications/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setApplications(applications.filter(app => !selectedApps.includes(app._id)));
        setJobs(jobs.map(job =>
          job._id === selectedJob._id ? { ...job, applicationCount: job.applicationCount - selectedApps.length } : job
        ));
        setSelectedApps([]);
        setSuccessMessage(`${selectedApps.length} applications deleted successfully.`);
        toast.success(`${selectedApps.length} applications deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError("Failed to delete some applications: " + (err.response?.data?.message || err.message));
        toast.error("Failed to delete some applications.");
      }
    }
  };

  const handleExportToExcel = async () => {
    if (applications.length === 0) {
      setError("No applications to export.");
      toast.error("No applications to export.");
      return;
    }
    setExportLoading(true);
    try {
      // Filter applications based on status, if selected
      const filteredApps = exportStatusFilter
        ? applications.filter(app => app.status === exportStatusFilter)
        : applications;
  
      if (filteredApps.length === 0) {
        setError("No applications match the selected status.");
        toast.error("No applications match the selected status.");
        return;
      }
  
      console.log("Applications for export:", filteredApps); // Debug log
  
      // Define column headers
      const headers = ["Name", "Email", "Contact", "Resume"];
  
      // Prepare data rows
      const tableData = filteredApps.map(app => ({
        Name: app.fullName || app.userId?.fullName || "N/A",
        Email: app.email || app.userId?.email || "N/A",
        Contact: app.phone || app.userId?.phone || "N/A",
        Resume: app.resume || "Not uploaded",
      }));
  
      // Create worksheet with headers
      const worksheet = XLSX.utils.json_to_sheet([{}], { header: headers, skipHeader: true });
      XLSX.utils.sheet_add_json(worksheet, tableData, { origin: "A3", skipHeader: true });
  
      // Add company header
      const companyHeader = [[`Company: ${selectedJob.companyName || "Unknown"}`], [""]];
      XLSX.utils.sheet_add_aoa(worksheet, companyHeader, { origin: "A1" });
  
      // Merge cells for company header
      worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  
      // Style company header
      worksheet["A1"].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: "center", vertical: "center" },
      };
  
      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Contact
        { wch: 50 }, // Resume
      ];
  
      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
  
      // Generate and download Excel file
      XLSX.writeFile(
        workbook,
        `${selectedJob.companyName || "Company"}_${selectedJob.profiles || "Job"}_Applications.xlsx`
      );
      toast.success("Applications exported to Excel successfully.");
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export applications: " + (err.message || "Unknown error"));
      toast.error("Failed to export applications: " + (err.message || "Unknown error"));
    } finally {
      setExportLoading(false);
    }
  };

  const handleServerExportToExcel = async () => {
    if (applications.length === 0) {
      setError("No applications to export.");
      toast.error("No applications to export.");
      return;
    }
    setExportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/applications/export/${selectedJob._id}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
        params: { status: exportStatusFilter || undefined },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedJob.companyName || "Company"}_${selectedJob.profiles || "Job"}_Applications.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Applications exported to Excel successfully.");
    } catch (err) {
      setError("Failed to export applications: " + (err.response?.data?.message || err.message));
      toast.error("Failed to export applications.");
    } finally {
      setExportLoading(false);
    }
  };

  const sortJobs = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    setJobs([...jobs].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      return direction === "asc"
        ? aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true })
        : bValue.toString().localeCompare(aValue.toString(), undefined, { numeric: true });
    }));
  };

  const sortApplications = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    setApplications([...applications].sort((a, b) => {
      const aValue = key === "appliedDate" ? a[key] : a.userId?.[key] || a[key] || "";
      const bValue = key === "appliedDate" ? b[key] : b.userId?.[key] || b[key] || "";
      return direction === "asc"
        ? aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true })
        : bValue.toString().localeCompare(aValue.toString(), undefined, { numeric: true });
    }));
  };

  const checkResumeUrl = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/applications/resume/check/${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.isValid;
    } catch (err) {
      console.error("Resume URL check failed:", err.response?.data?.message || err.message);
      return false;
    }
  };

  const handleDownloadResume = async (appId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/applications/resume/${appId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = response.headers["content-type"] || "application/pdf";
      if (!contentType.includes("pdf")) {
        throw new Error("Received file is not a PDF");
      }
      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${appId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded successfully.");
    } catch (err) {
      console.error("Download resume error:", err);
      const message = err.response?.data?.message || err.message || "Failed to download resume";
      setError(`Failed to download resume: ${message}`);
      toast.error(`Failed to download resume: ${message}`);
    }
  };

  const validateResumeUrl = (appId) => {
    return true; // Resume URL is validated via backend
  };

  const openAppModal = async (app) => {
    let resumeValid = false;
    if (app.resume) {
      console.log("Opening modal with resume URL:", app.resume);
      resumeValid = await checkResumeUrl(app._id);
    }
    setModalApp({ ...app, resumeValid });
  };

  const closeAppModal = () => setModalApp(null);

  const goBackToJobs = () => {
    setSelectedJob(null);
    setApplications([]);
    setBulkStatus("");
    setExportStatusFilter("");
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="admin-application-management1">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {!selectedJob ? (
        <>
          <div className="control-panel3">
            <button onClick={loadJobs} className="refresh-button1" disabled={loading}>
              {loading ? "Loading..." : "Refresh Jobs"}
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="no-items">No jobs found.</div>
          ) : (
            <div className="job-list">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => sortJobs("profiles")}>Job Profile</th>
                    <th onClick={() => sortJobs("companyName")}>Company</th>
                    <th onClick={() => sortJobs("ctcOrStipend")}>CTC/Stipend</th>
                    <th onClick={() => sortJobs("location")}>Location</th>
                    <th onClick={() => sortJobs("applicationCount")}>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job._id} className="job-row3">
                      <td>{job.profiles || "N/A"}</td>
                      <td>{job.companyName || "N/A"}</td>
                      <td>{job.ctcOrStipend || "N/A"}</td>
                      <td>{job.location || "N/A"}</td>
                      <td>{job.applicationCount || 0}</td>
                      <td>
                        <button onClick={() => loadApplications(job._id)} className="view-button">
                          View Applications
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="control-panel3">
            <button onClick={goBackToJobs} className="back-button">Back to Jobs</button>
            <button onClick={() => loadApplications(selectedJob._id)} className="refresh-button1" disabled={loading}>
              {loading ? "Loading..." : "Refresh Applications"}
            </button>
            <div className="export-controls">
              <select
                value={exportStatusFilter}
                onChange={(e) => setExportStatusFilter(e.target.value)}
                className="status-select"
              >
                <option value="">All Statuses</option>
                {["Applied", "Under Review", "Scheduled", "Accepted", "Rejected"].map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                onClick={handleExportToExcel}
                className="export-button"
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting..." : "Export to Excel"}
              </button>
            </div>
            {selectedApps.length > 0 && (
              <div className="bulk-actions3">
                <span>{selectedApps.length} selected</span>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="">Select Status</option>
                  {["Applied", "Under Review", "Scheduled", "Accepted", "Rejected"].map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button onClick={handleBulkStatusUpdate} className="update-status-button">
                  Update Status
                </button>
                <button onClick={handleBulkDelete} className="delete-button">Delete Selected</button>
              </div>
            )}
          </div>

          <h3>Applications for {selectedJob.profiles} - {selectedJob.companyName}</h3>

          {loading ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="no-items">No applications for this job.</div>
          ) : (
            <div className="application-list3">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedApps.length === applications.length && applications.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th onClick={() => sortApplications("fullName")}>Applicant Name</th>
                    <th onClick={() => sortApplications("email")}>Email</th>
                    <th onClick={() => sortApplications("status")}>Status</th>
                    <th onClick={() => sortApplications("appliedDate")}>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} className={`app-row status-${app.status.toLowerCase()}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedApps.includes(app._id)}
                          onChange={() => handleSelectApp(app._id)}
                        />
                      </td>
                      <td>{app.userId?.fullName || app.fullName || "N/A"}</td>
                      <td>{app.email || app.userId?.email || "N/A"}</td>
                      <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                      <td>{formatDate(app.appliedDate)}</td>
                      <td className="action-buttons">
                        <button onClick={() => openAppModal(app)} className="details-button">View</button>
                        <button onClick={() => handleDeleteApp(app._id)} className="delete-button">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {modalApp && (
        <div className="modal">
          <div className="modal-content">
            <h3>Application Details</h3>
            <div className="app-details">
              <div className="detail-section">
                <h4>Applicant Information</h4>
                <div className="detail-grid">
                  <div>
                    <p><strong>Name:</strong> {modalApp.userId?.fullName || modalApp.fullName || "N/A"}</p>
                    <p><strong>Email:</strong> {modalApp.email || modalApp.userId?.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {modalApp.phone || modalApp.userId?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>Roll No:</strong> {modalApp.userId?.rollNo || "N/A"}</p>
                    <p>
                      <strong>Resume:</strong>{" "}
                      {modalApp.resume && modalApp.resumeValid ? (
                        <>
                          <a
                            href={`${API_URL}/applications/resume/${modalApp._id}?view=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="resume-link"
                            onClick={() => console.log("Viewing resume for application:", modalApp._id)}
                          >
                            View Resume
                          </a>
                          <button
                            onClick={() => handleDownloadResume(modalApp._id)}
                            className="download-button"
                          >
                            Download Resume
                          </button>
                        </>
                      ) : (
                        "Resume unavailable"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="detail-section">
                <h4>Job Information</h4>
                <div className="detail-grid">
                  <div>
                    <p><strong>Profile:</strong> {modalApp.jobId?.profiles || "N/A"}</p>
                    <p><strong>Company:</strong> {modalApp.jobId?.companyName || "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>CTC/Stipend:</strong> {modalApp.jobId?.ctcOrStipend || "N/A"}</p>
                    <p><strong>Location:</strong> {modalApp.jobId?.location || "N/A"}</p>
                    <p><strong>Type:</strong> {modalApp.jobId?.offerType?.join(", ") || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="detail-section3">
                <h4>Application Status</h4>
                <p><strong>Status:</strong> {modalApp.status}</p>
                <p><strong>Applied Date:</strong> {formatDate(modalApp.appliedDate)}</p>
                <div className="status-buttons3">
                  {["Applied", "Under Review", "Scheduled", "Accepted", "Rejected"].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(modalApp._id, status)}
                      className={`status-button ${modalApp.status === status ? "active" : ""}`}
                      disabled={modalApp.status === status}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={closeAppModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationManagement;