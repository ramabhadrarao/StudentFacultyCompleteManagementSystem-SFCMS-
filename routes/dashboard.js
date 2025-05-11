// routes/dashboard.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Different dashboards based on user role
    const userRole = req.session.user.role;
    
    switch(userRole) {
      case 'admin':
        return res.render('dashboard/admin');
      case 'faculty':
        return res.render('dashboard/faculty');
      case 'student':
        return res.render('dashboard/student');
      case 'hod':
        return res.render('dashboard/hod');
      case 'principal':
        return res.render('dashboard/principal');
      default:
        return res.render('dashboard/default');
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/login');
  }
});

module.exports = router;