// routes/student.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Get all students (Admin, Principal, HOD, Faculty)
router.get('/', isAuthenticated, hasRole(['admin', 'principal', 'hod', 'faculty']), async (req, res) => {
  try {
    const batchId = req.query.batch;
    let students;
    
    if (batchId) {
      students = await Student.find({ batch_id: batchId })
        .populate('batch_id')
        .populate('gender_id')
        .sort({ name: 1 });
    } else {
      students = await Student.find()
        .populate('batch_id')
        .populate('gender_id')
        .sort({ name: 1 });
    }
    
    const batches = await Batch.find().sort({ start_year: -1 });
    
    res.render('student/index', { 
      students,
      batches,
      selectedBatch: batchId
    });
  } catch (err) {
    console.error('Error fetching students:', err);
    req.flash('error', 'Failed to load student list');
    res.redirect('/dashboard');
  }
});

// Student profile (self-view for student)
router.get('/profile', isAuthenticated, hasRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ 
      email: req.session.user.email 
    })
    .populate('batch_id')
    .populate('gender_id')
    .populate('nationality_id')
    .populate('religion_id')
    .populate('student_type_id')
    .populate('caste_id')
    .populate('sub_caste_id');
    
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/dashboard');
    }
    
    res.render('student/profile', { student });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    req.flash('error', 'Failed to load your profile');
    res.redirect('/dashboard');
  }
});

// More routes for student management...

module.exports = router;