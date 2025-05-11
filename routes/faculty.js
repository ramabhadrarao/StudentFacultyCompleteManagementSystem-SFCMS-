// routes/faculty.js
const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Get all faculty (Admin, Principal, HOD)
router.get('/', isAuthenticated, hasRole(['admin', 'principal', 'hod']), async (req, res) => {
  try {
    const faculty = await Faculty.find({ visibility: 'show' }).sort({ first_name: 1 });
    res.render('faculty/index', { faculty });
  } catch (err) {
    console.error('Error fetching faculty:', err);
    req.flash('error', 'Failed to load faculty list');
    res.redirect('/dashboard');
  }
});

// Faculty profile (self-view for faculty)
router.get('/profile', isAuthenticated, hasRole(['faculty']), async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ 
      email: req.session.user.email 
    });
    
    if (!faculty) {
      req.flash('error', 'Faculty profile not found');
      return res.redirect('/dashboard');
    }
    
    res.render('faculty/profile', { faculty });
  } catch (err) {
    console.error('Error fetching faculty profile:', err);
    req.flash('error', 'Failed to load your profile');
    res.redirect('/dashboard');
  }
});

// Edit faculty profile (self-edit for faculty)
router.get('/profile/edit', isAuthenticated, hasRole(['faculty']), async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ 
      email: req.session.user.email 
    });
    
    if (!faculty) {
      req.flash('error', 'Faculty profile not found');
      return res.redirect('/dashboard');
    }
    
    if (!faculty.edit_enabled) {
      req.flash('error', 'Profile editing is currently disabled');
      return res.redirect('/faculty/profile');
    }
    
    res.render('faculty/edit', { faculty });
  } catch (err) {
    console.error('Error preparing faculty edit:', err);
    req.flash('error', 'Failed to prepare profile for editing');
    res.redirect('/faculty/profile');
  }
});

// More routes for faculty management...

module.exports = router;