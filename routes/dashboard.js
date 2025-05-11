// routes/dashboard.js - Fix this file
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Dashboard home
router.get('/', isAuthenticated, (req, res) => {
  try {
    // Use a single dashboard file instead of trying to render different files based on role
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.session.user
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Failed to load dashboard');
    res.redirect('/login');
  }
});

module.exports = router;