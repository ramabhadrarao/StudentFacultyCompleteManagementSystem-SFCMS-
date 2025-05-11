const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Show login form
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// routes/auth.js - update the login route
// routes/auth.js (update the login route)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
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
module.exports = router;
