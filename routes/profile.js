// routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select('-password_hash');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }
    
    res.render('profile/index', {
      title: 'My Profile',
      user
    });
  } catch (err) {
    console.error('Profile error:', err);
    req.flash('error', 'An error occurred while loading your profile');
    res.redirect('/dashboard');
  }
});

module.exports = router;