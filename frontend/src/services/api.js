/**
 * Centralized API client for Vidyastra AI.
 * 
 * To integrate with your backend:
 * 1. Define 'VITE_API_URL' in your .env configuration (e.g., VITE_API_URL=http://localhost:5000/api)
 * 2. Set 'VITE_USE_MOCK=false' in your .env file.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Helper to handle standard HTTP requests to the backend
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// Helper to log administrative actions to our audit logs
function logAuditAction(action, detail) {
  try {
    const logs = JSON.parse(localStorage.getItem('vidyastra_audit_logs') || '[]');
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      action,
      detail,
      user: localStorage.getItem('currentUser') || 'admin'
    };
    localStorage.setItem('vidyastra_audit_logs', JSON.stringify([newLog, ...logs]));
  } catch (e) {
    console.error('Failed to log audit action:', e);
  }
}

// ----------------------------------------------------
// INITIALIZE MOCK DATA IN LOCALSTORAGE FOR DEVELOPMENT
// ----------------------------------------------------
const INITIAL_USERS = [
  { id: '1', username: 'student', name: 'Aman Sharma', email: 'aman.sharma@nitj.ac.in', role: 'student', department: 'Computer Science', details: { rollNo: '2025CS001', semester: '4th Semester' } },
  { id: '2', username: 'student2', name: 'Divya Patel', email: 'divya.patel@nitj.ac.in', role: 'student', department: 'Computer Science', details: { rollNo: '22103061', semester: '4th Semester' } },
  { id: '3', username: 'teacher', name: 'Dr. Urvashi', email: 'urvashi7@nitj.ac.in', role: 'teacher', department: 'Computer Science & Engineering', details: { title: 'Assistant Professor', facultyId: 'CSE-U7' } },
  { id: '4', username: 'admin', name: 'Dr. Rajesh Gupta', email: 'rajesh.gupta@nitj.ac.in', role: 'admin', department: 'IT Infrastructure', details: { title: 'System Administrator', facultyId: 'IT-R10' } }
];

const INITIAL_COURSES = [
  {
    id: 'CS302',
    code: 'CS302',
    name: 'Database Management Systems',
    semester: '4th Semester',
    department: 'Computer Science',
    students: 58,
    schedule: 'Mon, Wed, Fri (10:00 AM)',
    teacherId: '3', // Dr. Urvashi
    lectures: [
      { id: 1, title: 'Lecture 1: Introduction to DBMS & Relational Model', type: 'PDF Slides', date: '2026-05-10', url: '#' },
      { id: 2, title: 'Lecture 2: ER Diagrams & Schema Normalization', type: 'Video Link', date: '2026-05-18', url: '#' }
    ]
  },
  {
    id: 'CS401',
    code: 'CS401',
    name: 'Artificial Intelligence',
    semester: '6th Semester',
    department: 'Computer Science',
    students: 45,
    schedule: 'Tue, Thu (02:00 PM)',
    teacherId: '3', // Dr. Urvashi
    lectures: [
      { id: 1, title: 'Lecture 1: Search Algorithms (A*, BFS, DFS)', type: 'PDF Slides', date: '2026-05-12', url: '#' },
      { id: 2, title: 'Lecture 2: Introduction to Neural Networks', type: 'Notes', date: '2026-05-20', url: '#' }
    ]
  },
  {
    id: 'CS201',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    semester: '3rd Semester',
    department: 'Computer Science',
    students: 62,
    schedule: 'Mon, Wed (11:30 AM)',
    teacherId: '3', // Dr. Urvashi
    lectures: [
      { id: 1, title: 'Lecture 1: Time Complexity Analysis & Arrays', type: 'Notes', date: '2026-05-02', url: '#' }
    ]
  }
];

const INITIAL_SUBMISSIONS = [
  { id: 1, studentName: 'Aman Sharma', rollNo: '22103045', courseCode: 'CS302', assignmentName: 'Assignment 1: Schema Design', fileName: 'schema_design_v2.pdf', date: '2026-06-05', marks: '', feedback: '', status: 'Pending' },
  { id: 2, studentName: 'Divya Patel', rollNo: '22103061', courseCode: 'CS401', assignmentName: 'Assignment 2: A* Implementation', fileName: 'astar_code.zip', date: '2026-06-06', marks: '', feedback: '', status: 'Pending' },
  { id: 3, studentName: 'Rohan Verma', rollNo: '22103088', courseCode: 'CS201', assignmentName: 'Assignment 1: Linked Lists', fileName: 'linked_list.cpp', date: '2026-06-04', marks: '', feedback: '', status: 'Pending' },
  { id: 4, studentName: 'Pooja Singh', rollNo: '22103012', courseCode: 'CS302', assignmentName: 'Assignment 1: Schema Design', fileName: 'db_assignment_final.pdf', date: '2026-06-03', marks: '92', feedback: 'Great work on database normalization constraints.', status: 'Graded' }
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: 'Mid-Sem Syllabus Update', content: 'The Mid-Semester exam syllabus for DBMS (CS302) will cover Chapters 1 to 5.', courseCode: 'CS302', date: '2026-06-02' },
  { id: 2, title: 'Lab Assignment Extension', content: 'The deadline for AI Lab Assignment 2 has been extended to June 10th.', courseCode: 'CS401', date: '2026-06-07' }
];

const INITIAL_AI_SETTINGS = {
  provider: 'Gemini Pro',
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: 'You are Vidyastra AI, an advanced educational copilot for NIT Jalandhar. Support students with their computer science coursework, explanations, and grading outlines. Be professional, structured, and informative.'
};

const INITIAL_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-06-08 10:00:00', action: 'System Setup', detail: 'Vidyastra AI System initialized successfully.', user: 'system' },
  { id: 2, timestamp: '2026-06-08 11:15:00', action: 'AI Provider Configured', detail: 'AI system linked to Google Gemini endpoint.', user: 'admin' }
];

function initLocalStorageDB() {
  if (!localStorage.getItem('vidyastra_users')) {
    localStorage.setItem('vidyastra_users', JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem('vidyastra_courses')) {
    localStorage.setItem('vidyastra_courses', JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem('vidyastra_submissions')) {
    localStorage.setItem('vidyastra_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
  }
  if (!localStorage.getItem('vidyastra_announcements')) {
    localStorage.setItem('vidyastra_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
  }
  if (!localStorage.getItem('vidyastra_ai_settings')) {
    localStorage.setItem('vidyastra_ai_settings', JSON.stringify(INITIAL_AI_SETTINGS));
  }
  if (!localStorage.getItem('vidyastra_audit_logs')) {
    localStorage.setItem('vidyastra_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
  }
}

// Perform initialization on script execution if mock mode is on
if (USE_MOCK) {
  initLocalStorageDB();
}

// ----------------------------------------------------
// EXPORTED API CLIENT INTERFACE
// ----------------------------------------------------
const api = {
  // --- AUTHENTICATION ENDPOINTS ---
  login: async (username, password) => {
    if (USE_MOCK) {
      // Simulation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const user = users.find(u => u.username === username.toLowerCase().trim());
      
      if (!user) {
        throw new Error('Invalid username. Use "student", "teacher", or "admin" for testing.');
      }
      
      // Store current session info
      localStorage.setItem('token', 'mock-jwt-token-xyz');
      localStorage.setItem('currentUser', user.username);
      localStorage.setItem('currentUserRole', user.role);
      localStorage.setItem('currentUserName', user.name);
      
      return {
        success: true,
        token: 'mock-jwt-token-xyz',
        user: user
      };
    } else {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', response.user.username);
        localStorage.setItem('currentUserRole', response.user.role);
        localStorage.setItem('currentUserName', response.user.name);
      }
      return response;
    }
  },

  forgotPassword: async (input) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const userExists = users.some(u => u.username === input.trim() || u.email === input.trim());
      if (!userExists) {
        throw new Error('No user found with the provided username or email.');
      }
      return { success: true, message: 'Password reset link sent to registered email.' };
    } else {
      return apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ input })
      });
    }
  },

  logout: async () => {
    if (USE_MOCK) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserRole');
      localStorage.removeItem('currentUserName');
      return { success: true };
    } else {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch (e) {
        console.error('Logout error on server', e);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('currentUserName');
      }
      return { success: true };
    }
  },

  // --- STUDENT DASHBOARD ENDPOINTS ---
  getStudentProfile: async () => {
    if (USE_MOCK) {
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const username = localStorage.getItem('currentUser') || 'student';
      const user = users.find(u => u.username === username);
      return user || users[0];
    } else {
      return apiRequest('/student/profile');
    }
  },

  getStudentRecentActivity: async () => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { id: 1, detail: 'Logged in from IP 192.168.1.4' },
        { id: 2, detail: 'Submitted Lab Assignment 2 for AI course' },
        { id: 3, detail: 'Viewed DBMS schema normalization slides' }
      ];
    } else {
      return apiRequest('/student/activity');
    }
  },

  // --- TEACHER DASHBOARD ENDPOINTS ---
  getTeacherProfile: async () => {
    if (USE_MOCK) {
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const username = localStorage.getItem('currentUser') || 'teacher';
      const user = users.find(u => u.username === username);
      return user || users[2];
    } else {
      return apiRequest('/teacher/profile');
    }
  },

  uploadLecture: async (courseCode, title, type, url) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const courses = JSON.parse(localStorage.getItem('vidyastra_courses') || '[]');
      const updatedCourses = courses.map(course => {
        if (course.code === courseCode) {
          const newLecture = {
            id: Date.now(),
            title,
            type,
            date: new Date().toISOString().split('T')[0],
            url: url || '#'
          };
          return {
            ...course,
            lectures: [...(course.lectures || []), newLecture]
          };
        }
        return course;
      });
      localStorage.setItem('vidyastra_courses', JSON.stringify(updatedCourses));
      logAuditAction('Lecture Uploaded', `Uploaded ${type} - "${title}" to course ${courseCode}`);
      return { success: true };
    } else {
      return apiRequest(`/teacher/courses/${courseCode}/lectures`, {
        method: 'POST',
        body: JSON.stringify({ title, type, url })
      });
    }
  },

  getSubmissions: async () => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return JSON.parse(localStorage.getItem('vidyastra_submissions') || '[]');
    } else {
      return apiRequest('/teacher/submissions');
    }
  },

  gradeSubmission: async (submissionId, marks, feedback) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const submissions = JSON.parse(localStorage.getItem('vidyastra_submissions') || '[]');
      let gradedItem = null;
      const updated = submissions.map(sub => {
        if (sub.id === submissionId) {
          gradedItem = sub;
          return {
            ...sub,
            marks,
            feedback: feedback || 'No comments.',
            status: 'Graded',
            date: new Date().toISOString().split('T')[0]
          };
        }
        return sub;
      });
      localStorage.setItem('vidyastra_submissions', JSON.stringify(updated));
      if (gradedItem) {
        logAuditAction('Assignment Graded', `Graded ${gradedItem.studentName}'s work for ${gradedItem.courseCode} with mark ${marks}/100`);
      }
      return { success: true };
    } else {
      return apiRequest(`/teacher/submissions/${submissionId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ marks, feedback })
      });
    }
  },

  createAnnouncement: async (title, content, courseCode) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const announcements = JSON.parse(localStorage.getItem('vidyastra_announcements') || '[]');
      const newAnn = {
        id: Date.now(),
        title,
        content,
        courseCode,
        date: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('vidyastra_announcements', JSON.stringify([newAnn, ...announcements]));
      logAuditAction('Announcement Broadcasted', `Published announcement "${title}" for course ${courseCode}`);
      return { success: true, announcement: newAnn };
    } else {
      return apiRequest('/teacher/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, content, courseCode })
      });
    }
  },

  getAnnouncements: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('vidyastra_announcements') || '[]');
    } else {
      return apiRequest('/teacher/announcements');
    }
  },

  // --- ADMIN DASHBOARD ENDPOINTS ---
  getOverviewStats: async () => {
    if (USE_MOCK) {
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const courses = JSON.parse(localStorage.getItem('vidyastra_courses') || '[]');
      const submissions = JSON.parse(localStorage.getItem('vidyastra_submissions') || '[]');
      
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalFaculty = users.filter(u => u.role === 'teacher').length;
      const totalCourses = courses.length;
      const pendingGrades = submissions.filter(s => s.status === 'Pending').length;
      
      return {
        totalStudents,
        totalFaculty,
        totalCourses,
        pendingGrades,
        aiRequestsToday: 184,
        averageResponseTimeMs: 420
      };
    } else {
      return apiRequest('/admin/stats');
    }
  },

  getSystemHealth: async () => {
    if (USE_MOCK) {
      // Return simulated fluctuating resource values
      const cpu = Math.floor(Math.random() * 20) + 15; // 15-35%
      const ram = Math.floor(Math.random() * 5) + 62; // 62-67%
      const ping = Math.floor(Math.random() * 15) + 32; // 32-47ms
      return {
        cpuUsage: cpu,
        memoryUsage: ram,
        dbConnection: 'Healthy',
        llmEndpoint: 'Operational',
        latencyMs: ping
      };
    } else {
      return apiRequest('/admin/health');
    }
  },

  getUsers: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
    } else {
      return apiRequest('/admin/users');
    }
  },

  addUser: async (user) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      
      // Auto assign username
      const username = user.name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 90 + 10);
      const newUser = {
        id: Date.now().toString(),
        username,
        ...user,
        details: user.role === 'student' 
          ? { rollNo: user.details?.rollNo || '2026CS' + Math.floor(Math.random() * 100), semester: user.details?.semester || '1st Semester' }
          : { title: user.details?.title || 'Assistant Professor', facultyId: user.details?.facultyId || 'FAC-' + Math.floor(Math.random() * 100) }
      };

      localStorage.setItem('vidyastra_users', JSON.stringify([...users, newUser]));
      logAuditAction('User Registered', `Added user ${newUser.name} with role ${newUser.role}`);
      return { success: true, user: newUser };
    } else {
      return apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(user)
      });
    }
  },

  editUser: async (userId, updatedData) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 600));
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const updated = users.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ...updatedData,
            details: {
              ...(u.details || {}),
              ...(updatedData.details || {})
            }
          };
        }
        return u;
      });
      localStorage.setItem('vidyastra_users', JSON.stringify(updated));
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        logAuditAction('User Modified', `Updated details for ${targetUser.name}`);
      }
      return { success: true };
    } else {
      return apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
    }
  },

  deleteUser: async (userId) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const users = JSON.parse(localStorage.getItem('vidyastra_users') || '[]');
      const targetUser = users.find(u => u.id === userId);
      const filtered = users.filter(u => u.id !== userId);
      localStorage.setItem('vidyastra_users', JSON.stringify(filtered));
      if (targetUser) {
        logAuditAction('User Deleted', `Removed user ${targetUser.name} (${targetUser.role})`);
      }
      return { success: true };
    } else {
      return apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
    }
  },

  getCourses: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('vidyastra_courses') || '[]');
    } else {
      return apiRequest('/admin/courses');
    }
  },

  addCourse: async (course) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const courses = JSON.parse(localStorage.getItem('vidyastra_courses') || '[]');
      const newCourse = {
        id: course.code,
        students: 0,
        lectures: [],
        ...course
      };
      localStorage.setItem('vidyastra_courses', JSON.stringify([...courses, newCourse]));
      logAuditAction('Course Created', `Registered new course: ${course.code} - ${course.name}`);
      return { success: true, course: newCourse };
    } else {
      return apiRequest('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(course)
      });
    }
  },

  getAISettings: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('vidyastra_ai_settings') || '{}');
    } else {
      return apiRequest('/admin/settings/ai');
    }
  },

  updateAISettings: async (settings) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('vidyastra_ai_settings', JSON.stringify(settings));
      logAuditAction('AI System Configuration Updated', `Changed provider to ${settings.provider}, temp to ${settings.temperature}`);
      return { success: true };
    } else {
      return apiRequest('/admin/settings/ai', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
    }
  },

  testAIConnection: async (provider) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, status: 'Connected successfully', latencyMs: Math.floor(Math.random() * 200) + 100 };
    } else {
      return apiRequest('/admin/settings/ai/test', {
        method: 'POST',
        body: JSON.stringify({ provider })
      });
    }
  },

  getAuditLogs: async () => {
    if (USE_MOCK) {
      return JSON.parse(localStorage.getItem('vidyastra_audit_logs') || '[]');
    } else {
      return apiRequest('/admin/logs');
    }
  }
};

export default api;
