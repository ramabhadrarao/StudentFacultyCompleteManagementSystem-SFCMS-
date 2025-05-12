// controllers/dashboardController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const College = require('../models/College');
const Batch = require('../models/Batch');
const Program = require('../models/Program');
const Notification = require('../models/Notification');

// Dashboard home with live data
exports.index = async (req, res) => {
  try {
    // Initialize stats object for different roles
    let stats = {};
    let notifications = [];
    
    // Load role-specific data
    if (req.session.user) {
      // Fetch the most recent notifications for this user
      try {
        notifications = await Notification.find({ user_id: req.session.user.id })
          .sort({ createdAt: -1 })
          .limit(5);
      } catch (notifErr) {
        console.error('Error fetching notifications:', notifErr);
        notifications = [];
      }
      
      if (req.session.user.role === 'admin') {
        // Load admin dashboard stats with actual counts
        try {
          // Count entities
          const userCount = await User.countDocuments();
          const studentCount = await Student.countDocuments();
          const facultyCount = await Faculty.countDocuments();
          const departmentCount = await Department.countDocuments();
          const collegeCount = await College.countDocuments();
          const batchCount = await Batch.countDocuments();
          const programCount = await Program.countDocuments();
          
          // Get active vs inactive users
          const activeUserCount = await User.countDocuments({ is_active: true });
          const inactiveUserCount = userCount - activeUserCount;
          
          stats = {
            userCount,
            studentCount,
            facultyCount,
            departmentCount,
            collegeCount,
            batchCount,
            programCount,
            activeUserCount,
            inactiveUserCount
          };
        } catch (err) {
          console.error('Error fetching admin stats:', err);
        }
      } else if (req.session.user.role === 'principal') {
        // Load principal dashboard stats
        try {
          const studentCount = await Student.countDocuments();
          const facultyCount = await Faculty.countDocuments();
          const departmentCount = await Department.countDocuments();
          
          stats = {
            studentCount,
            facultyCount,
            departmentCount
          };
        } catch (err) {
          console.error('Error fetching principal stats:', err);
        }
      } else if (req.session.user.role === 'faculty' || req.session.user.role === 'hod') {
        // Add faculty dashboard stats
        try {
          // Get the faculty profile
          const faculty = await Faculty.findOne({ email: req.session.user.email });
          
          // Get assigned courses/students if faculty is found
          if (faculty) {
            // We would need to adjust this based on your actual faculty assignment/student models
            const studentCount = await Student.countDocuments();
            
            stats = {
              studentCount,
              // Add other faculty-specific stats here
              facultyId: faculty._id
            };
          }
        } catch (err) {
          console.error('Error fetching faculty stats:', err);
        }
      } else if (req.session.user.role === 'student') {
        // Add student dashboard stats
        try {
          // Fetch student profile
          const student = await Student.findOne({ email: req.session.user.email });
          
          if (student) {
            // Student-specific stats
            stats = {
              studentId: student._id,
              // Add other student-specific stats
            };
          }
        } catch (err) {
          console.error('Error fetching student stats:', err);
        }
      }
    }
    
    // Get recent activities/logs if needed
    const recentActivities = []; // You could populate this from your activity logs
    
    // Render dashboard with actual data
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      stats,
      notifications,
      recentActivities
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