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
// routes/profile.js - Add edit profile routes

// Show edit form
router.get('/edit', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select('-password_hash');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }
    
    res.render('profile/edit', {
      title: 'Edit Profile',
      user
    });
  } catch (err) {
    console.error('Profile edit error:', err);
    req.flash('error', 'An error occurred while loading your profile');
    res.redirect('/profile');
  }
});

// Process edit form
router.post('/edit', isAuthenticated, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }
    
    // Validate unique email if changed
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        req.flash('error', 'Email already in use');
        return res.redirect('/profile/edit');
      }
    }
    
    // Validate unique username if changed
    if (username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameExists) {
        req.flash('error', 'Username already in use');
        return res.redirect('/profile/edit');
      }
    }
    
    // Update user
    user.username = username;
    user.email = email;
    await user.save();
    
    // Update session
    req.session.user.username = username;
    req.session.user.email = email;
    
    req.flash('success', 'Profile updated successfully');
    res.redirect('/profile');
  } catch (err) {
    console.error('Profile update error:', err);
    req.flash('error', 'An error occurred while updating your profile');
    res.redirect('/profile/edit');
  }
});

// Change password
router.get('/change-password', isAuthenticated, (req, res) => {
  res.render('profile/change-password', {
    title: 'Change Password'
  });
});

router.post('/change-password', isAuthenticated, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    
    // Find user
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/dashboard');
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      req.flash('error', 'Current password is incorrect');
      return res.redirect('/profile/change-password');
    }
    
    // Validate new password
    if (new_password !== confirm_password) {
      req.flash('error', 'New passwords do not match');
      return res.redirect('/profile/change-password');
    }
    
    // Update password
    user.password_hash = await bcrypt.hash(new_password, 10);
    await user.save();
    
    req.flash('success', 'Password changed successfully');
    res.redirect('/profile');
  } catch (err) {
    console.error('Password change error:', err);
    req.flash('error', 'An error occurred while changing your password');
    res.redirect('/profile/change-password');
  }
});

module.exports = router;