// controllers/dashboardController.js
const User = require('../models/User');

// Dashboard home
exports.index = async (req, res) => {
  try {
    // Initialize stats object for different roles
    const stats = {};
    
    // Render dashboard with data
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user,
      stats: {},
      notifications: []
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