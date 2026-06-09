import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStudentProfile(),
      api.getStudentRecentActivity()
    ])
      .then(([profileData, activityData]) => {
        setProfile(profileData);
        setActivities(activityData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load student dashboard data', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    api.logout().then(() => {
      navigate('/');
    });
  };

  if (loading) {
    return (
      <div className="bg-[#e9ecef] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003A6A] mx-auto"></div>
          <p className="text-[#003A6A] mt-4 font-semibold">Loading Student Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e9ecef] font-sans min-h-screen flex flex-col">
      {/* Embedded CSS for custom animations and hover effects */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .dashboard-card:hover {
          transform: translateY(-3px);
          transition: all 0.25s ease;
        }
      `}</style>

      {/* Top Yellow Stripe */}
      <div className="w-full h-1 bg-[#FECD0B]"></div>

      {/* Header */}
      <header className="bg-[#003A6A] w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center md:justify-start">
            <a href="/student-dashboard">
              <img
                src="https://v1.nitj.ac.in/erp/Images/logo.png"
                alt="NIT Jalandhar Logo"
                className="w-auto max-w-full max-h-12 md:max-h-20 h-auto object-contain"
              />
            </a>
          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className="bg-[#222] w-full shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <span className="text-[#FECD0B] font-semibold text-lg md:text-xl tracking-wide">
              | Vidyastra AI Dashboard |
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm font-medium transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto animate-fade-in-up">

          {/* Welcome Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-[#003A6A]">
              Welcome, {profile?.name || 'Student'}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your learning activities through the Vidyastra AI Dashboard.
            </p>
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#003A6A] mb-4">
              Student Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Student ID</p>
                <p className="font-semibold">{profile?.details?.rollNo || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Department</p>
                <p className="font-semibold">{profile?.department || 'N/A'}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Semester</p>
                <p className="font-semibold">{profile?.details?.semester || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="dashboard-card bg-white rounded-xl shadow-lg p-6 cursor-pointer">
              <h3 className="text-lg font-semibold text-[#003A6A] mb-2">
                📚 Courses
              </h3>
              <p className="text-gray-500">
                Access enrolled courses and learning materials.
              </p>
            </div>

            <div className="dashboard-card bg-white rounded-xl shadow-lg p-6 cursor-pointer">
              <h3 className="text-lg font-semibold text-[#003A6A] mb-2">
                📝 Assignments
              </h3>
              <p className="text-gray-500">
                View and submit pending assignments.
              </p>
            </div>

            <div className="dashboard-card bg-white rounded-xl shadow-lg p-6 cursor-pointer">
              <h3 className="text-lg font-semibold text-[#003A6A] mb-2">
                📊 Results
              </h3>
              <p className="text-gray-500">
                Check academic performance and grades.
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#003A6A] mb-4">
              Recent Activity
            </h2>

            <ul className="space-y-3">
              {activities.length === 0 ? (
                <li className="text-gray-500 italic text-sm">No recent activities found.</li>
              ) : (
                activities.map((act) => (
                  <li key={act.id} className="border-b pb-3 text-gray-700 last:border-0 last:pb-0">
                    {act.detail}
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#003A6A] w-full mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <p className="text-white text-xs md:text-sm text-center">
            Copyright 2026 &copy; NIT Jalandhar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;