// Enhanced student routes configuration
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const studentController = require('../controllers/studentController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Configure multer for student photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/students';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `student-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed'));
  }
});

// CSV upload configuration for imports
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, `student-import-${Date.now()}.csv`);
  }
});

const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Student Dashboard - available to students for self-management
router.get('/dashboard', hasRole(['student']), studentController.dashboard);

// Routes accessible by admin, principal, hod, and faculty
router.get('/', hasRole(['admin', 'principal', 'hod', 'faculty']), studentController.getStudents);
router.get('/view/:id', studentController.getStudentById); // Both students and staff can view, controller handles permissions

// Routes accessible only by admin, principal, and hod
const adminRoles = ['admin', 'principal', 'hod'];
router.get('/create', hasRole(adminRoles), studentController.createStudentForm);
router.post('/create', hasRole(adminRoles), upload.single('photo'), studentController.createStudent);
router.get('/edit/:id', studentController.editStudentForm); // Both students and staff can edit, controller handles permissions
router.post('/edit/:id', upload.single('photo'), studentController.updateStudent); // Both students and staff can update, controller handles permissions
router.post('/delete/:id', hasRole(adminRoles), studentController.deleteStudent);
router.post('/reset-password/:id', hasRole(adminRoles), studentController.resetPassword);

// Ajax route for sub-castes
router.get('/subcastes/:casteId', studentController.getSubcastesByCaste);

// Import/export routes
router.get('/import', hasRole(['admin']), studentController.importStudentsForm);
router.post('/import', hasRole(['admin']), csvUpload.single('csv'), studentController.importStudents);
router.get('/import/result', hasRole(['admin']), studentController.importResult);
router.get('/import/template', hasRole(['admin']), studentController.generateImportTemplate);
router.get('/export', hasRole(adminRoles), studentController.exportStudents);

// Freeze/Unfreeze Profile Routes
router.post('/freeze-profile/:id', studentController.freezeProfile); // Both students and staff can freeze, controller handles permissions
router.post('/unfreeze-profile/:id', hasRole(adminRoles), studentController.unfreezeProfile);
router.post('/request-unfreeze/:id', hasRole(['student']), studentController.requestUnfreeze);
router.post('/process-unfreeze-request/:id', hasRole(adminRoles), studentController.processUnfreezeRequest);

module.exports = router;