import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'grading', 'announcements', 'profile'

  // Dynamic States loaded from API
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradedSubmissions, setGradedSubmissions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedCourseForUpload, setSelectedCourseForUpload] = useState(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureType, setLectureType] = useState('PDF Slides');
  const [lectureUrl, setLectureUrl] = useState('');

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCourse, setNewAnnCourse] = useState('');

  // Interactive Toast Notifications
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const loadDashboardData = () => {
    return Promise.all([
      api.getTeacherProfile(),
      api.getCourses(),
      api.getSubmissions(),
      api.getAnnouncements()
    ])
      .then(([profileData, coursesData, submissionsData, announcementsData]) => {
        setProfile(profileData);

        // Filter courses assigned to this teacher
        const teacherCourses = coursesData.filter(c => c.teacherId === profileData.id);
        setCourses(teacherCourses);

        // Default the announcement form course to the first course code
        if (teacherCourses.length > 0 && !newAnnCourse) {
          setNewAnnCourse(teacherCourses[0].code);
        }

        const courseCodes = teacherCourses.map(c => c.code);

        // Submissions
        setSubmissions(submissionsData.filter(s => s.status === 'Pending' && courseCodes.includes(s.courseCode)));
        setGradedSubmissions(submissionsData.filter(s => s.status === 'Graded' && courseCodes.includes(s.courseCode)));

        // Announcements
        setAnnouncements(announcementsData.filter(a => courseCodes.includes(a.courseCode)));

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load teacher dashboard data', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    api.logout().then(() => {
      navigate('/');
    });
  };

  // Lecture Upload Handler
  const openUploadModal = (course) => {
    setSelectedCourseForUpload(course);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setSelectedCourseForUpload(null);
    setLectureTitle('');
    setLectureType('PDF Slides');
    setLectureUrl('');
  };

  const handleUploadLecture = (e) => {
    e.preventDefault();
    if (!lectureTitle.trim()) {
      triggerToast('Please provide a lecture title.');
      return;
    }

    api.uploadLecture(selectedCourseForUpload.code, lectureTitle, lectureType, lectureUrl.trim())
      .then(() => {
        triggerToast(`Successfully uploaded "${lectureTitle}" to ${selectedCourseForUpload.code}!`);
        closeUploadModal();
        return loadDashboardData();
      })
      .catch(err => {
        triggerToast('Failed to upload lecture: ' + err.message);
      });
  };

  // Grading Handler
  const handleGradeSubmission = (submissionId, marks, feedback) => {
    if (!marks || isNaN(marks) || marks < 0 || marks > 100) {
      triggerToast('Please enter a valid grade mark between 0 and 100.');
      return;
    }

    api.gradeSubmission(submissionId, parseInt(marks), feedback)
      .then(() => {
        triggerToast(`Graded submission successfully!`);
        return loadDashboardData();
      })
      .catch(err => {
        triggerToast('Failed to grade: ' + err.message);
      });
  };

  // Announcement Handler
  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      triggerToast('Please complete all announcement fields.');
      return;
    }

    api.createAnnouncement(newAnnTitle, newAnnContent, newAnnCourse)
      .then(() => {
        setNewAnnTitle('');
        setNewAnnContent('');
        triggerToast('New announcement published successfully!');
        return loadDashboardData();
      })
      .catch(err => {
        triggerToast('Failed to announce: ' + err.message);
      });
  };

  // Computed values
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);

  if (loading) {
    return (
      <div className="bg-[#e9ecef] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003A6A] mx-auto"></div>
          <p className="text-[#003A6A] mt-4 font-semibold">Loading Faculty Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#e9ecef] font-sans min-h-screen flex flex-col relative text-[#333]">
      {/* Custom styles for animations & layout */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .dashboard-tab-active {
          border-bottom: 3px solid #FECD0B;
          color: #FECD0B !important;
          font-weight: 600;
        }
        .course-card:hover, .sub-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }
      `}</style>

      {/* Top Yellow Stripe */}
      <div className="w-full h-1 bg-[#FECD0B]"></div>

      {/* Header */}
      <header className="bg-[#003A6A] w-full overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <a href="/teacher-dashboard">
                <img
                  src="https://v1.nitj.ac.in/erp/Images/logo.png"
                  alt="NIT Jalandhar Logo"
                  className="w-auto max-w-full max-h-12 md:max-h-20 h-auto object-contain"
                />
              </a>
            </div>
            {/* Quick user welcome badge on header */}
            <div className="hidden md:flex items-center gap-3 text-white">
              <div className="text-right">
                <p className="font-semibold text-sm">{profile?.name || 'Dr. Urvashi'}</p>
                <p className="text-xs text-yellow-300">{profile?.details?.title || 'Assistant Professor'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-800 border-2 border-[#FECD0B] flex items-center justify-center font-bold text-lg text-[#FECD0B]">
                {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navbar & Tab Selection */}
      <nav className="bg-[#222] w-full shadow-md text-gray-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between sm:h-14 py-2 sm:py-0">
            <div className="flex items-center space-x-2">
              <span className="text-[#FECD0B] font-bold text-lg md:text-xl tracking-wide uppercase">
                | Vidyastra Faculty Panel |
              </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-4 mt-2 sm:mt-0 w-full sm:w-auto justify-center">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3 py-2 text-sm transition-colors hover:text-white cursor-pointer ${activeTab === 'courses' ? 'dashboard-tab-active' : ''}`}
              >
                My Courses
              </button>
              <button
                onClick={() => setActiveTab('grading')}
                className={`px-3 py-2 text-sm transition-colors hover:text-white cursor-pointer ${activeTab === 'grading' ? 'dashboard-tab-active' : ''}`}
              >
                Grading Queue ({submissions.length})
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`px-3 py-2 text-sm transition-colors hover:text-white cursor-pointer ${activeTab === 'announcements' ? 'dashboard-tab-active' : ''}`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 text-sm transition-colors hover:text-white cursor-pointer ${activeTab === 'profile' ? 'dashboard-tab-active' : ''}`}
              >
                Faculty Profile
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs md:text-sm font-medium transition cursor-pointer ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#003A6A] text-white border-l-4 border-[#FECD0B] shadow-2xl px-5 py-3 rounded-lg flex items-center space-x-3 animate-fade-in-up">
          <span className="text-[#FECD0B] font-semibold">ℹ️ Info:</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto animate-fade-in-up">

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-600 text-center">
              <span className="text-gray-500 text-xs uppercase block font-semibold">Active Courses</span>
              <span className="text-2xl md:text-3xl font-extrabold text-[#003A6A]">{courses.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-emerald-600 text-center">
              <span className="text-gray-500 text-xs uppercase block font-semibold">Total Students</span>
              <span className="text-2xl md:text-3xl font-extrabold text-[#003A6A]">{totalStudents}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-orange-500 text-center">
              <span className="text-gray-500 text-xs uppercase block font-semibold">Pending Grades</span>
              <span className="text-2xl md:text-3xl font-extrabold text-orange-600">{submissions.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-purple-600 text-center">
              <span className="text-gray-500 text-xs uppercase block font-semibold">Classes Today</span>
              <span className="text-2xl md:text-3xl font-extrabold text-purple-700">2 Lectures</span>
            </div>
          </div>

          {/* TAB CONTENTS */}

          {/* Tab 1: My Courses */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#003A6A]">Course Administration</h2>
                    <p className="text-gray-600 text-sm">Upload syllabus lectures, files, and links for courses assigned to you.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-4">
                  {courses.map((course) => (
                    <div key={course.id} className="course-card bg-gray-50 border border-gray-200 rounded-xl p-5 transition-all duration-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4">
                        <div>
                          <span className="inline-block bg-[#003A6A] text-[#FECD0B] text-xs font-bold px-2.5 py-1 rounded-full mb-1">
                            {course.code}
                          </span>
                          <h3 className="text-lg font-bold text-[#003A6A]">{course.name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span>📅 {course.schedule}</span>
                            <span>🎓 {course.semester}</span>
                            <span>👥 {course.students} Students</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openUploadModal(course)}
                          className="mt-3 md:mt-0 bg-[#003A6A] hover:bg-[#004a8a] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
                        >
                          <span>➕</span>
                          <span>Upload Lecture</span>
                        </button>
                      </div>

                      {/* Course Lectures List */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2.5">Uploaded Lectures & Learning Materials:</h4>
                        {course.lectures.length === 0 ? (
                          <p className="text-gray-500 text-xs italic">No lecture documents uploaded yet. Click "Upload Lecture" above to add.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {course.lectures.map((lec) => (
                              <div key={lec.id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-xs">
                                <div>
                                  <p className="text-xs font-bold text-gray-800 line-clamp-1">{lec.title}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${lec.type === 'PDF Slides' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        lec.type === 'Video Link' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                          'bg-amber-50 text-amber-700 border border-amber-200'
                                      }`}>
                                      {lec.type}
                                    </span>
                                    <span className="text-[10px] text-gray-400">📅 {lec.date}</span>
                                  </div>
                                </div>
                                <a
                                  href={lec.url}
                                  onClick={(e) => { if (lec.url === '#') { e.preventDefault(); triggerToast('Link simulated. In production, this opens the upload file/URL.'); } }}
                                  className="text-xs text-[#003A6A] hover:underline font-semibold"
                                >
                                  View
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Grading Queue */}
          {activeTab === 'grading' && (
            <div className="space-y-6">
              {/* Pending Submissions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#003A6A] mb-2">Pending Student Assignments</h2>
                <p className="text-gray-600 text-sm mb-6">Review student submissions and assign marks out of 100.</p>

                {submissions.length === 0 ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg p-4 text-center">
                    🎉 Excellent! All submitted student assignments have been graded.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {submissions.map((sub) => (
                      <GradingItem
                        key={sub.id}
                        sub={sub}
                        onSubmitGrade={(marks, feedback) => handleGradeSubmission(sub.id, marks, feedback)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Graded Submissions History */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#003A6A] mb-4">Graded Student Record History</h3>
                {gradedSubmissions.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No graded record history found for this session.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course / Assignment</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Evaluated</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Feedback Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {gradedSubmissions.map((gs) => (
                          <tr key={gs.id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-gray-800">{gs.studentName}</div>
                              <div className="text-xs text-gray-500">Roll: {gs.rollNo}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-sm mr-2">{gs.courseCode}</span>
                              <span className="text-gray-700">{gs.assignmentName}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">{gs.date}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                                {gs.marks} / 100
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate" title={gs.feedback}>
                              {gs.feedback}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Announcements */}
          {activeTab === 'announcements' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List of Previous Announcements */}
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <h2 className="text-2xl font-bold text-[#003A6A] mb-4">Board Announcements</h2>
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="border-l-4 border-[#003A6A] bg-gray-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold uppercase text-[#003A6A]">
                          Course: {ann.courseCode}
                        </span>
                        <span className="text-xs text-gray-400">📅 {ann.date}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-md">{ann.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish New Announcement Form */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-[#003A6A] mb-4">📢 Publish Announcement</h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Select Course</label>
                    <select
                      value={newAnnCourse}
                      onChange={(e) => setNewAnnCourse(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-[#003A6A]"
                    >
                      {courses.map(c => (
                        <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Test Cancelled, Class Postponed"
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-[#003A6A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Content Detail</label>
                    <textarea
                      rows="4"
                      placeholder="Write detailed notification information here..."
                      value={newAnnContent}
                      onChange={(e) => setNewAnnContent(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-[#003A6A]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#003A6A] hover:bg-[#004a8a] text-white font-bold text-sm py-2.5 rounded-lg transition duration-200 cursor-pointer shadow-xs"
                  >
                    Broadcast Announcement
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 4: Faculty Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#003A6A] mb-6">Faculty Information Registry</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Avatar Card */}
                <div className="bg-gray-50 border rounded-xl p-5 text-center flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-800 border-4 border-[#FECD0B] flex items-center justify-center font-bold text-3xl text-[#FECD0B] shadow-md mb-4">
                    {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'VK'}
                  </div>
                  <h3 className="text-lg font-bold text-[#003A6A]">{profile?.name || 'Dr. Urvashi'}</h3>
                  <p className="text-sm text-gray-500 font-medium">{profile?.details?.title || 'Assistant Professor'}</p>
                  <span className="inline-block mt-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-0.5 rounded-full font-semibold">
                    Active Faculty Role
                  </span>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Faculty ID</span>
                    <span className="font-semibold text-gray-800 text-md">{profile?.details?.facultyId || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Department</span>
                    <span className="font-semibold text-gray-800 text-md">{profile?.department || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Email Address</span>
                    <span className="font-semibold text-gray-800 text-md">{profile?.email || 'N/A'}</span>
                  </div>
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Office Address</span>
                    <span className="font-semibold text-gray-800 text-md">---------</span>
                  </div>
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Official Phone</span>
                    <span className="font-semibold text-gray-800 text-md">+91----------</span>
                  </div>
                  <div className="bg-gray-50 border p-4 rounded-lg">
                    <span className="text-xs text-gray-400 block font-semibold">Joined Institute</span>
                    <span className="font-semibold text-gray-800 text-md">--------</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LECTURE UPLOAD MODAL */}
      {isUploadModalOpen && selectedCourseForUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={closeUploadModal}></div>

          {/* Modal Container */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up border-t-8 border-[#003A6A]">
            <button
              onClick={closeUploadModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-[#003A6A] mb-1">Upload Lecture Resource</h3>
            <p className="text-xs text-gray-500 mb-4">Adding learning material to course: <strong className="text-[#003A6A]">{selectedCourseForUpload.code}</strong></p>

            <form onSubmit={handleUploadLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Lecture Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lecture 3: SQL Subqueries"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-[#003A6A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Resource Type</label>
                <select
                  value={lectureType}
                  onChange={(e) => setLectureType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-[#003A6A]"
                >
                  <option value="PDF Slides">PDF Slides</option>
                  <option value="Video Link">Video Link</option>
                  <option value="Notes">Notes / Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Resource Link / URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://drive.google.com/..."
                  value={lectureUrl}
                  onChange={(e) => setLectureUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-[#003A6A]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Optional. Link to Google Drive, YouTube, or PDF storage.</span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#003A6A] hover:bg-[#004a8a] text-white text-sm font-semibold py-2 rounded-lg cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

// Subcomponent for Grading item to keep parent cleaner and isolate states
const GradingItem = ({ sub, onSubmitGrade }) => {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    onSubmitGrade(marks, feedback);
  };

  return (
    <div className="sub-card bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#003A6A] text-[#FECD0B] text-[10px] font-bold px-2 py-0.5 rounded-sm">
              {sub.courseCode}
            </span>
            <span className="text-xs text-gray-400">Submitted on: {sub.date}</span>
          </div>
          <h4 className="text-md font-bold text-[#003A6A] mt-1">{sub.assignmentName}</h4>
          <p className="text-sm text-gray-700 mt-1">
            Student: <strong className="text-gray-950">{sub.studentName}</strong> (Roll No: {sub.rollNo})
          </p>
        </div>

        <div className="mt-2.5 md:mt-0 bg-white border px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs">
          <span className="text-gray-400">📄 File:</span>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert(`Simulated downloading file: ${sub.fileName}`); }}
            className="text-blue-600 hover:underline font-medium"
          >
            {sub.fileName}
          </a>
        </div>
      </div>

      <form onSubmit={handleGradeSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Marks (Max 100) *</label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="e.g. 85"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-[#003A6A]"
            required
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Feedback Comments</label>
          <input
            type="text"
            placeholder="e.g. Good derivation, minor calculation error."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-[#003A6A]"
          />
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full bg-[#003A6A] hover:bg-[#004a8a] text-white font-bold text-sm py-2 rounded-lg transition duration-200 cursor-pointer shadow-xs"
          >
            ✓ Submit Grade
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherDashboard;
