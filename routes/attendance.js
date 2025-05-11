// routes/attendance.js
const express = require('express');
const router = express.Router();
const EnhancedAttendance = require('../models/EnhancedAttendance');
const Course = require('../models/Course');
const Student = require('../models/Student');
const FacultyTeachingAssignment = require('../models/FacultyTeachingAssignment');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Get attendance marking form (Faculty)
router.get('/mark', isAuthenticated, hasRole(['faculty']), async (req, res) => {
  try {
    // Get courses assigned to this faculty
    const faculty = await Faculty.findOne({ email: req.session.user.email });
    
    if (!faculty) {
      req.flash('error', 'Faculty profile not found');
      return res.redirect('/dashboard');
    }
    
    const assignments = await FacultyTeachingAssignment.find({ 
      faculty_id: faculty._id,
      is_primary_faculty: true
    })
    .populate('course_id')
    .populate('semester_id');
    
    res.render('attendance/mark', { 
      assignments,
      today: new Date().toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Error loading attendance form:', err);
    req.flash('error', 'Failed to load attendance form');
    res.redirect('/dashboard');
  }
});

// Submit attendance (Faculty)
router.post('/mark', isAuthenticated, hasRole(['faculty']), async (req, res) => {
  try {
    const { 
      course_id, 
      attendance_date, 
      period_number,
      class_type,
      students
    } = req.body;
    
    const faculty = await Faculty.findOne({ email: req.session.user.email });
    
    if (!faculty) {
      req.flash('error', 'Faculty profile not found');
      return res.redirect('/dashboard');
    }
    
    // Create attendance records
    const attendanceRecords = [];
    
    for (const studentId in students) {
      const status = students[studentId];
      
      attendanceRecords.push({
        student_id: studentId,
        course_id,
        faculty_id: faculty._id,
        attendance_date,
        period_number,
        class_type,
        status,
        marked_by_user_id: req.session.user.id,
        marked_datetime: new Date()
      });
    }
    
    await EnhancedAttendance.insertMany(attendanceRecords);
    
    req.flash('success', 'Attendance recorded successfully');
    res.redirect('/attendance/mark');
  } catch (err) {
    console.error('Error recording attendance:', err);
    req.flash('error', 'Failed to record attendance');
    res.redirect('/attendance/mark');
  }
});

// View attendance (Students)
router.get('/view', isAuthenticated, hasRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.session.user.email });
    
    if (!student) {
      req.flash('error', 'Student profile not found');
      return res.redirect('/dashboard');
    }
    
    // Get attendance records for the current semester
    const attendance = await EnhancedAttendance.find({
      student_id: student._id
    })
    .populate('course_id')
    .populate('faculty_id')
    .sort({ attendance_date: -1 });
    
    // Calculate attendance percentages
    const coursesAttendance = {};
    
    attendance.forEach(record => {
      const courseId = record.course_id._id.toString();
      
      if (!coursesAttendance[courseId]) {
        coursesAttendance[courseId] = {
          course: record.course_id,
          total: 0,
          present: 0,
          percentage: 0
        };
      }
      
      coursesAttendance[courseId].total++;
      
      if (record.status === 'Present') {
        coursesAttendance[courseId].present++;
      }
    });
    
    // Calculate percentages
    Object.values(coursesAttendance).forEach(course => {
      course.percentage = (course.present / course.total) * 100;
    });
    
    res.render('attendance/view', {
      attendance,
      coursesAttendance: Object.values(coursesAttendance)
    });
  } catch (err) {
    console.error('Error viewing attendance:', err);
    req.flash('error', 'Failed to load attendance records');
    res.redirect('/dashboard');
  }
});

// More routes for attendance management...

module.exports = router;