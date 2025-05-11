// controllers/dashboardController.js
const User = require('../models/User');

// Dashboard home
// Update to controllers/dashboardController.js

// Modify the index method to include additional data for admin dashboard
exports.index = async (req, res) => {
  try {
    // Initialize stats object for different roles
    let stats = {};
    
    // Load role-specific data
    if (req.session.user) {
      if (req.session.user.role === 'admin') {
        // Load admin dashboard stats
        const User = require('../models/User');
        const Student = require('../models/Student');
        const Faculty = require('../models/Faculty');
        const Department = require('../models/Department');
        const Batch = require('../models/Batch');
        
        // Count entities
        const userCount = await User.countDocuments();
        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const departmentCount = await Department.countDocuments();
        const batchCount = await Batch.countDocuments();
        
        stats = {
          userCount,
          studentCount,
          facultyCount,
          departmentCount,
          batchCount
        };
      } else if (req.session.user.role === 'principal') {
        // Load principal dashboard stats
        const Student = require('../models/Student');
        const Faculty = require('../models/Faculty');
        const Department = require('../models/Department');
        
        // Count entities
        const studentCount = await Student.countDocuments();
        const facultyCount = await Faculty.countDocuments();
        const departmentCount = await Department.countDocuments();
        
        // You could add more principal-specific stats here
        
        stats = {
          studentCount,
          facultyCount,
          departmentCount
        };
      } else if (req.session.user.role === 'faculty' || req.session.user.role === 'hod') {
        // Add faculty dashboard stats
        // To be implemented
      } else if (req.session.user.role === 'student') {
        // Add student dashboard stats
        // To be implemented
      }
    }
    
    // Get recent notifications if needed
    const notifications = []; // You can populate this from your notification system
    
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