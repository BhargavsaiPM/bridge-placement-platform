import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './layout/AdminLayout';
import CompanyLayout from './layout/CompanyLayout';
import OfficerLayout from './layout/OfficerLayout';
import UserLayout from './layout/UserLayout';

import Home from './pages/public/Home';
import JobSearch from './pages/public/JobSearch';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// User Pages
import UserProfile from './pages/user/Profile';
import UserDashboard from './pages/user/Dashboard';
import UserApplications from './pages/user/Applications';

// Officer Pages
import OfficerProfile from './pages/officer/Profile';
import OfficerJobs from './pages/officer/Jobs';
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerApplicants from './pages/officer/Applicants';
import OfficerStudents from './pages/officer/Students';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Approvals from './pages/admin/Approvals';
import AdminAnalytics from './pages/admin/Analytics';
import Activity from './pages/admin/Activity';
import Kanban from './pages/admin/Kanban';
import Reports from './pages/admin/Reports';

// Company Pages
import CompanyDashboard from './pages/company/Dashboard';
import CompanyProfile from './pages/company/Profile';
import Officers from './pages/company/Officers';
import Jobs from './pages/company/Jobs';
import Applicants from './pages/company/Applicants';
import SelectedStudents from './pages/company/SelectedStudents';
import CompanyAnalytics from './pages/company/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* User Protected Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="applications" element={<UserApplications />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Protected Officer Routes */}
        <Route path="/officer" element={<OfficerLayout />}>
          <Route index element={<Navigate to="/officer/dashboard" replace />} />
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="profile" element={<OfficerProfile />} />
          <Route path="jobs" element={<OfficerJobs />} />
          <Route path="applicants" element={<OfficerApplicants />} />
          <Route path="students" element={<OfficerStudents />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="activity" element={<Activity />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Protected Company Routes */}
        <Route path="/company" element={<CompanyLayout />}>
          <Route index element={<Navigate to="/company/dashboard" replace />} />
          <Route path="dashboard" element={<CompanyDashboard />} />
          <Route path="profile" element={<CompanyProfile />} />
          <Route path="officers" element={<Officers />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="students" element={<SelectedStudents />} />
          <Route path="analytics" element={<CompanyAnalytics />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
