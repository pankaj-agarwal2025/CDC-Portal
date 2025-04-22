import React, { useState, useEffect } from 'react';
import axios from "axios";
import './AdminUserManagement.css';

const AdminUserManagement = ({ fetchUsers, updateUser, deleteUser, changeUserRole, createUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNo: '',
    role: 'student',
    status: 'active',
    rollNo: ''
  });
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    loadUsers();
  }, [roleFilter, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters = {
        role: roleFilter !== 'all' ? roleFilter : null,
        search: searchTerm || null,
      };
      const response = await fetchUsers(filters);
      let userData;
      if (Array.isArray(response)) {
        userData = response;
      } else if (response && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        userData = response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
      setUsers(userData);
      setError(null);
      setSelectedUsers([]);
    } catch (err) {
      setError('Failed to load users: ' + (err.message || 'Unknown error'));
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = await createUser(userForm);
      setUsers([...users, newUser]);
      setShowAddUser(false);
      setUserForm({ fullName: '', email: '', password: '', mobileNo: '', role: 'student', status: 'active', rollNo: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUserId, userForm);
      setUsers(users.map((user) => (user._id === editingUserId ? { ...user, ...userForm } : user)));
      setShowEditUser(false);
      setEditingUserId(null);
      setUserForm({ fullName: "", email: "", password: "", mobileNo: "", role: "student", status: "active", rollNo: "" });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
      console.error("Error updating user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        setSelectedUsers(selectedUsers.filter(id => id !== userId));
      } catch (err) {
        setError('Failed to delete user.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError(`Failed to change user role to ${newRole}.`);
      console.error('Error changing role:', err);
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      fullName: user.fullName || '',
      email: user.email || '',
      mobileNo: user.mobileNo || '',
      role: user.role || 'student',
      status: user.status || 'active',
      rollNo: user.rollNo || ''
    });
    setShowEditUser(true);
  };

  const cancelEdit = () => {
    setShowEditUser(false);
    setEditingUserId(null);
    setUserForm({ fullName: '', email: '', password: '', mobileNo: '', role: 'student', status: 'active', rollNo: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map(user => user._id));
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
      try {
        await Promise.all(selectedUsers.map(id => deleteUser(id)));
        setUsers(users.filter(user => !selectedUsers.includes(user._id)));
        setSelectedUsers([]);
      } catch (err) {
        setError('Failed to delete some users.');
        console.error('Error bulk deleting:', err);
      }
    }
  };

  const handleBulkChangeRole = async (newRole) => {
    if (window.confirm(`Are you sure you want to change the role of ${selectedUsers.length} users to ${newRole}?`)) {
      try {
        await Promise.all(selectedUsers.map(id => changeUserRole(id, newRole)));
        setUsers(users.map(user => 
          selectedUsers.includes(user._id) ? { ...user, role: newRole } : user
        ));
        setSelectedUsers([]);
      } catch (err) {
        setError(`Failed to change role to ${newRole} for some users.`);
        console.error('Error bulk changing role:', err);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const sortUsers = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    setUsers([...users].sort((a, b) => {
      const aValue = a[key] || '';
      const bValue = b[key] || '';
      return direction === 'asc' 
        ? aValue.localeCompare(bValue, undefined, { numeric: true }) 
        : bValue.localeCompare(aValue, undefined, { numeric: true });
    }));
  };

  const openUserModal = async (user) => {
    if (user.role === "student") {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/profile/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModalUser(response.data);
      } catch (err) {
        setError("Failed to fetch student details.");
        console.error("Error fetching student details:", err.response?.data || err.message);
        setModalUser(user);
      }
    } else {
      setModalUser(user);
    }
  };

  const closeUserModal = () => {
    setModalUser(null);
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date))) return 'Not available';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="admin-user-management">
      <h2>User Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="control-panel1">
        <div className="filter-controls">
          <label>
            Role:
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
              <option value="admin">Admins</option>
            </select>
          </label>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name, email, or roll no"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          
          <button onClick={loadUsers} className="refresh-button">Refresh</button>
          <button onClick={() => setShowAddUser(true)} className="add-user-button">Add User</button>
        </div>
        
        {selectedUsers.length > 0 && (
          <div className="bulk-actions">
            <span>{selectedUsers.length} selected</span>
            <div className="bulk-role-change">
              <select 
                onChange={(e) => e.target.value && handleBulkChangeRole(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Change Role</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button onClick={handleBulkDelete} className="delete-button">Delete Selected</button>
          </div>
        )}
      </div>

      {showAddUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={userForm.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mobileNo">Mobile</label>
                  <input
                    type="text"
                    id="mobileNo"
                    name="mobileNo"
                    value={userForm.mobileNo}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div className="form-group">
                    <label htmlFor="rollNo">Roll Number</label>
                    <input
                      type="text"
                      id="rollNo"
                      name="rollNo"
                      value={userForm.rollNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={userForm.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Create User</button>
                <button type="button" onClick={() => setShowAddUser(false)} className="cancel-button">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={userForm.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mobileNo">Mobile</label>
                  <input
                    type="text"
                    id="mobileNo"
                    name="mobileNo"
                    value={userForm.mobileNo}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div className="form-group">
                    <label htmlFor="rollNo">Roll Number</label>
                    <input
                      type="text"
                      id="rollNo"
                      name="rollNo"
                      value={userForm.rollNo}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={userForm.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" onClick={cancelEdit} className="cancel-button">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="no-items">No users found.</div>
      ) : (
        <div className="user-list">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th onClick={() => sortUsers('fullName')}>
                  Name {sortConfig.key === 'fullName' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => sortUsers('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => sortUsers('role')}>
                  Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => sortUsers('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th onClick={() => sortUsers('createdAt')}>
                  Created {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className={`user-row ${user.status || 'active'}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                  <td><span className={`status-badge ${user.status || 'active'}`}>{user.status || 'active'}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="action-buttons">
                    <button onClick={() => openUserModal(user)} className="details-button">View</button>
                    <button onClick={() => startEditUser(user)} className="edit-button">Edit</button>
                    <button onClick={() => handleDeleteUser(user._id)} className="delete-button">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalUser && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalUser.role === "student" ? "Student Profile" : "User Details"}</h3>
              {modalUser.profilePhoto ? (
                <div className="profile-photo-container">
                  <img
                    src={`${API_URL.replace(/\/$/, '')}/${modalUser.profilePhoto.replace(/^\/+/, '')}`}
                    alt={`${modalUser.fullName}'s Profile`}
                    className="profile-photo"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                </div>
              ) : (
                <div className="profile-photo-container">
                  <img
                    src="/default-avatar.png"
                    alt="Default Profile"
                    className="profile-photo"
                  />
                </div>
              )}
            </div>
            <div className="user-details">
              <div className="detail-section">
                <h4>User Information</h4>
                <div className="detail-grid">
                  <div>
                    <p><strong>ID:</strong> {modalUser._id}</p>
                    <p><strong>Name:</strong> {modalUser.fullName}</p>
                    <p><strong>Email:</strong> {modalUser.email}</p>
                  </div>
                  <div>
                    <p><strong>Mobile:</strong> {modalUser.mobileNo || 'Not provided'}</p>
                    <p><strong>Role:</strong> {modalUser.role}</p>
                    <p><strong>Status:</strong> {modalUser.status || 'active'}</p>
                  </div>
                </div>
              </div>

              {modalUser.role === 'student' && (
                <>
                  <div className="detail-section">
                    <h4>Personal Information</h4>
                    <div className="detail-grid">
                      <div>
                        <p><strong>Roll Number:</strong> {modalUser.rollNo || 'Not provided'}</p>
                        <p><strong>WhatsApp:</strong> {modalUser.whatsappNo || 'Not provided'}</p>
                        <p><strong>Father's Name:</strong> {modalUser.fatherName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p><strong>Father's Number:</strong> {modalUser.fatherNumber || 'Not provided'}</p>
                        <p><strong>Alternate Email:</strong> {modalUser.mailId || 'Not provided'}</p>
                        <p><strong>Ready to Relocate:</strong> {modalUser.readyToRelocate ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Education</h4>
                    <div className="detail-grid">
                      <div>
                        <p><strong>10th:</strong> {modalUser.education?.tenth?.percentage || 'N/A'}% ({modalUser.education?.tenth?.passingYear || 'N/A'})</p>
                        <p><strong>12th:</strong> {modalUser.education?.twelfth?.percentage || 'N/A'}% ({modalUser.education?.twelfth?.passingYear || 'N/A'})</p>
                      </div>
                      <div>
                        <p><strong>Graduation:</strong> {modalUser.education?.graduation?.degree || 'N/A'} - {modalUser.education?.graduation?.percentageOrCGPA || 'N/A'} ({modalUser.education?.graduation?.passingYear || 'N/A'})</p>
                        <p><strong>Masters:</strong> {modalUser.education?.masters?.degree || 'N/A'} - {modalUser.education?.masters?.percentageOrCGPA || 'N/A'} ({modalUser.education?.masters?.passingYear || 'N/A'})</p>
                      </div>
                    </div>
                    <p><strong>Backlogs:</strong> {modalUser.existingBacklogs || 'None'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>School Information</h4>
                    <p><strong>School:</strong> {modalUser.school || 'Not provided'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {modalUser.skills && modalUser.skills.length > 0 ? (
                        modalUser.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill.name || skill}</span>
                        ))
                      ) : (
                        <p>Not provided</p>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Certifications</h4>
                    {modalUser.certifications && modalUser.certifications.length > 0 ? (
                      <ul className="certifications-list">
                        {modalUser.certifications.map((cert, index) => (
                          <li key={index}>
                            {cert.name} {cert.image && <a href={`${API_URL.replace(/\/$/, '')}/${cert.image.replace(/^\/+/, '')}`} target="_blank" rel="noopener noreferrer">[View]</a>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No certifications</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Experience</h4>
                    {modalUser.experience && modalUser.experience.length > 0 && modalUser.experience[0].hasExperience ? (
                      <ul className="experience-list">
                        {modalUser.experience.map((exp, index) => (
                          <li key={index}>
                            <strong>{exp.organizationName}</strong> - {exp.duration || 'N/A'}<br />
                            {exp.details || 'No details provided'}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No experience</p>
                    )}
                  </div>

                  <div className="detail-section">
                    <h4>Uploads</h4>
                    <div className="uploads-grid">
                      <p><strong>Resume:</strong> {modalUser.resume ? <a href={`${API_URL.replace(/\/$/, '')}/${modalUser.resume.replace(/^\/+/, '')}`} target="_blank" rel="noopener noreferrer">View Resume</a> : 'Not uploaded'}</p>
                      <p><strong>Profile Photo:</strong> {modalUser.profilePhoto ? <a href={`${API_URL.replace(/\/$/, '')}/${modalUser.profilePhoto.replace(/^\/+/, '')}`} target="_blank" rel="noopener noreferrer">View Photo</a> : 'Not uploaded'}</p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Other Details</h4>
                    <p><strong>Area of Interest:</strong> {modalUser.areaOfInterest || 'Not provided'}</p>
                  </div>
                </>
              )}

              <div className="detail-section">
                <h4>Activity</h4>
                <div className="detail-grid">
                  <div><p><strong>Created:</strong> {formatDate(modalUser.createdAt)}</p></div>
                  <div><p><strong>Last Updated:</strong> {formatDate(modalUser.updatedAt)}</p></div>
                </div>
              </div>

              <div className="role-change-section">
                <h4>Change Role</h4>
                <div className="role-buttons">
                  <button 
                    onClick={() => handleChangeRole(modalUser._id, 'student')}
                    className={`role-button ${modalUser.role === 'student' ? 'active' : ''}`}
                    disabled={modalUser.role === 'student'}
                  >
                    Student
                  </button>
                  <button 
                    onClick={() => handleChangeRole(modalUser._id, 'staff')}
                    className={`role-button ${modalUser.role === 'staff' ? 'active' : ''}`}
                    disabled={modalUser.role === 'staff'}
                  >
                    Staff
                  </button>
                  <button 
                    onClick={() => handleChangeRole(modalUser._id, 'admin')}
                    className={`role-button ${modalUser.role === 'admin' ? 'active' : ''}`}
                    disabled={modalUser.role === 'admin'}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
            <button onClick={closeUserModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;