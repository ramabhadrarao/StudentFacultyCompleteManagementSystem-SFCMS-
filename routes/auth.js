const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show login form
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// routes/auth.js - update the login route
// routes/auth.js - Enhance login route with remember me functionality
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }

    // Update last login time
    user.last_login = new Date();
    await user.save();

    // Set user session - make sure this includes the role
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    // Set cookie expiration for "remember me"
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    
    req.flash('success', 'Login successful');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'An error occurred during login');
    res.redirect('/login');
  }
});
// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// routes/auth.js - add registration routes
router.get('/register', (req, res) => {
  try {
    res.render('auth/register');
  } catch (err) {
    console.error('Register page error:', err);
    res.status(500).send('Error loading registration page');
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, password2, role } = req.body;
    
    // Simple validation
    const errors = [];
    
    // Check required fields
    if (!username || !email || !password || !password2) {
      errors.push('Please fill in all fields');
    }
    
    // Check passwords match
    if (password !== password2) {
      errors.push('Passwords do not match');
    }
    
    // Check password length
    if (password.length < 6) {
      errors.push('Password should be at least 6 characters');
    }
    
    // If there are errors, re-render the form
    if (errors.length > 0) {
      return res.render('auth/register', {
        errors,
        username,
        email
      });
    }
    
    // Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      errors.push('Email is already registered');
      return res.render('auth/register', {
        errors,
        username
      });
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: role || 'student', // Default role
      is_active: true
    });
    
    await newUser.save();
    
    req.flash('success', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'An error occurred during registration');
    res.redirect('/register');
  }
});

// routes/auth.js - Add password reset routes

// Forgot password form
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password');
});

// Process forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      req.flash('error', 'No account with that email address exists');
      return res.redirect('/forgot-password');
    }
    
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiry
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    
    // In a real application, you would send an email here
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    req.flash('success', 'Password reset instructions have been sent to your email');
    res.redirect('/login');
  } catch (err) {
    console.error('Password reset error:', err);
    req.flash('error', 'An error occurred');
    res.redirect('/forgot-password');
  }
});

// Reset password form
router.get('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    res.render('auth/reset-password', {
      token: req.params.token
    });
  } catch (err) {
    console.error('Reset password error:', err);
    req.flash('error', 'An error occurred');
    res.redirect('/forgot-password');
  }
});

// Process reset password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, password2 } = req.body;
    
    // Validate passwords
    if (password !== password2) {
      req.flash('error', 'Passwords do not match');
      return res.redirect(`/reset-password/${req.params.token}`);
    }
    
    // Find user
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired');
      return res.redirect('/forgot-password');
    }
    
    // Update password
    user.password_hash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    req.flash('success', 'Your password has been updated. You can now log in');
    res.redirect('/login');
  } catch (err) {
    console.error('Password reset error:', err);
    req.flash('error', 'An error occurred');
    res.redirect('/forgot-password');
  }
});

module.exports = router;
