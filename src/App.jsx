import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser } from "./redux/authSlice";

import LandingPage from "./pages/LandingPage";
import AuthContainer from "./pages/loginPage/AuthContainer";
import StudentDetails from "./pages/studentform/StudentDetails";
import CampusConnectDashboard from "./pages/dashboard/Dashboard";
import CDCTrainings from "./pages/job-listings/CDCTrainings";
import DashboardLayout from "./layouts/DashboardLayout";
import ProfilePage from "./pages/profile/Profile";
import JobListingPage from "./pages/job-listings/JobListings";
import JobPostForm from "./pages/admin/JobPosting";
import AdminPanel from "./pages/admin/AdminPanel";
import ProtectedRoute from './redux/ProtectedRoute';
import MyApplications from "./pages/job-listings/Applications";
import VerifyEmail from "./pages/loginPage/VerifyEmail";
import CVInsightsPage from "./pages/job-listings/CV";
import About from "./components/About";
import InterviewInsights from "./pages/job-listings/InterviewInsights";
import AdminInterviewManagement from "./pages/admin/AdminInterviewManagement";
import SubmitInterviewExperience from "./pages/job-listings/SubmitInterviewExperience";


function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  if (loading && localStorage.getItem("token")) {
    return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
  }

  const redirectToDashboard = () => {
    if (!isAuthenticated && !localStorage.getItem("token")) {
      return <Navigate to="/auth-Container" />;
    }
    
    if ((loading || !user) && localStorage.getItem("token")) {
      return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
    }
    
    if (user && user.role) {
      switch(user.role) {
        case 'admin':
        case 'staff':
          return <Navigate to="/admin-panel" />;
        case 'student':
          return <Navigate to="/student-details" />;
        default:
          return <Navigate to="/auth-Container" />;
      }
    }
    
    // Fallback
    return <Navigate to="/auth-Container" />;
  };
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth-Container" element={
          isAuthenticated && user && user.role ? 
            <Navigate to={user.role === 'admin' || user.role === 'staff' ? '/admin-panel' : '/student-details'} /> 
            : 
            <AuthContainer />
        } />
        <Route path="/submit-interview-experience" element={<SubmitInterviewExperience />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/about" element={<About />} />

        {/* Protected Profile Setup */}
        <Route 
          path="/student-details" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDetails />
            </ProtectedRoute>
          } 
        />

        {/* Student Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><CampusConnectDashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cdc-trainings" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><CDCTrainings /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/interview-insights" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><InterviewInsights /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-applications" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><MyApplications /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/job-listings" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><JobListingPage /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cv" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><CVInsightsPage /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout><ProfilePage /></DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin & Staff Routes */}
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-panel/interview-experiences" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <AdminInterviewManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post-job" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <JobPostForm />
            </ProtectedRoute>
          } 
        />

        {/* Catch-All Route */}
        <Route path="*" element={redirectToDashboard()} />
      </Routes>
    </Router>
  );
}

export default App;