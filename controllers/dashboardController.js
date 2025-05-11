// controllers/dashboardController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const Program = require('../models/Program');
const Course = require('../models/Course');

// Dashboard home
exports.index = async (req, res) => {
  try {
    // Initialize stats object for different roles
    const stats = {};
    
    // Common data fetching based on user role
    if (req.session.user.role === 'admin') {
      // Admin dashboard data
      stats.facultyCount = await Faculty.countDocuments({ visibility: 'show' }) || 0;
      stats.studentCount = await Student.countDocuments() || 0;
      stats.departmentCount = await Department.countDocuments() || 0;
      stats.programCount = await Program.countDocuments() || 0;
      
      // Recent activities - could be fetched from a dedicated Activity model in future
      stats.recentActivities = [
        {
          title: 'New faculty onboarded: John Smith',
          description: 'Completed registration process for Department of Computer Science',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          isNew: true
        },
        {
          title: 'New program created: B.Tech in Data Science',
          description: 'Added 32 courses to the new program curriculum',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          isNew: false
        },
        {
          title: 'Student batch created: 2025-29 CSE',
          description: 'Added 120 students to the new batch',
          timestamp: new Date(Date.now() - 259200000), // 3 days ago
          isNew: false
        }
      ];
    } 
    else if (req.session.user.role === 'faculty' || req.session.user.role === 'hod') {
      // Faculty/HOD dashboard data
      // You would fetch actual course assignments, schedules, etc.
      stats.courseCount = 5; // Example value
      stats.classesToday = 3; // Example value
      stats.pendingTasks = 7; // Example value
      stats.avgAttendance = 82; // Example percentage
      
      // Example schedule - this would come from your database
      stats.todaySchedule = [
        {
          time: '09:00 - 10:00',
          course: 'Data Structures',
          batch: 'B.Tech CSE 3rd Sem',
          room: 'LH-201'
        },
        {
          time: '11:00 - 12:00',
          course: 'Database Management',
          batch: 'B.Tech CSE 5th Sem',
          room: 'LH-305'
        },
        {
          time: '14:00 - 16:00',
          course: 'Computer Networks Lab',
          batch: 'B.Tech CSE 4th Sem',
          room: 'Lab-102'
        }
      ];
    }
    else if (req.session.user.role === 'student') {
      // Student dashboard data
      // Get actual student data from the database
      const student = await Student.findOne({ email: req.session.user.email });
      if (student) {
        // You would fetch these from proper models in a real system
        stats.courseCount = 6; // Example value
        stats.classesToday = 4; // Example value
        stats.overallAttendance = 89; // Example percentage
        stats.cgpa = 8.5; // Example value
        
        // Example schedule - would come from database
        stats.todaySchedule = [
          {
            time: '09:00 - 10:00',
            course: 'Data Structures',
            faculty: 'Prof. Johnson',
            room: 'LH-201'
          },
          {
            time: '10:00 - 11:00',
            course: 'Discrete Mathematics',
            faculty: 'Prof. Williams',
            room: 'LH-203'
          },
          {
            time: '12:00 - 13:00',
            course: 'OOPS Using Java',
            faculty: 'Prof. Davis',
            room: 'LH-205'
          },
          {
            time: '14:00 - 16:00',
            course: 'Digital Logic Lab',
            faculty: 'Prof. Miller',
            room: 'Lab-101'
          }
        ];
        
        // Example attendance data - would come from database
        stats.courseAttendance = [
          { course: 'Data Structures', percentage: 92, attended: 22, total: 24 },
          { course: 'Discrete Mathematics', percentage: 88, attended: 21, total: 24 },
          { course: 'OOPS Using Java', percentage: 85, attended: 17, total: 20 },
          { course: 'Computer Networks', percentage: 79, attended: 19, total: 24 },
          { course: 'Database Management', percentage: 75, attended: 18, total: 24 },
          { course: 'Software Engineering', percentage: 67, attended: 16, total: 24 }
        ];
      }
    }
    else if (req.session.user.role === 'principal') {
      // Principal dashboard data
      stats.departmentCount = await Department.countDocuments() || 0;
      stats.facultyCount = await Faculty.countDocuments({ visibility: 'show' }) || 0;
      stats.studentCount = await Student.countDocuments() || 0;
      stats.overallAttendance = 86; // Example percentage
      
      // Example department data - would be fetched from database
      stats.departments = [
        { name: 'Computer Science', hod: 'Dr. Johnson', facultyCount: 18, studentCount: 450, attendance: 91 },
        { name: 'Electrical Engineering', hod: 'Dr. Williams', facultyCount: 15, studentCount: 380, attendance: 88 },
        { name: 'Mechanical Engineering', hod: 'Dr. Davis', facultyCount: 16, studentCount: 420, attendance: 87 },
        { name: 'Civil Engineering', hod: 'Dr. Miller', facultyCount: 14, studentCount: 350, attendance: 82 }
      ];
    }
    
    // Common notifications for all users
    const notifications = [
      {
        title: 'System Maintenance Notice',
        message: 'The system will be down for maintenance on Sunday, May 15, 2025, from 2:00 AM to 5:00 AM.',
        type: 'danger',
        isNew: true,
        timestamp: new Date()
      },
      {
        title: 'Academic Calendar Updated',
        message: 'The academic calendar for the upcoming semester has been updated. Please check for exam dates.',
        type: 'info',
        isNew: false,
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      },
      {
        title: 'New Feature: Mobile App',
        message: 'Our new mobile app is available now. Download it from the app store for convenient access.',
        type: 'info',
        isNew: false,
        timestamp: new Date(Date.now() - 604800000) // 1 week ago
      }
    ];
    
    // Render dashboard with data
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      stats,
      notifications
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Failed to load dashboard data');
    
    // Render dashboard with minimal data
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      stats: {},
      notifications: []
    });
  }
};