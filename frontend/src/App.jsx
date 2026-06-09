import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your components
import VidyastraLogin from './pages/loginpage.jsx';
import ForgotPassword from './pages/forgot_password.jsx';
import StudentDashboard from './pages/Student_dashboard.jsx';
import TeacherDashboard from './pages/Teacher_dashboard.jsx';
import AdminDashboard from './pages/Admin_dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The main login page */}
        <Route path="/" element={<VidyastraLogin />} />

        {/* The forgot password page */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* The Student dashboard page */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />

        {/* The Teacher dashboard page */}
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        {/* The Admin dashboard page */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;