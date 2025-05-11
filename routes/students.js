// routes/students.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/students');
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

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// CSV upload configuration for imports
const csvStorage = multer.memoryStorage();
const csvUpload = multer({
  storage: csvStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Routes accessible by admin, principal, hod, and faculty
router.get('/', hasRole(['admin', 'principal', 'hod', 'faculty']), studentController.getStudents);
router.get('/view/:id', hasRole(['admin', 'principal', 'hod', 'faculty']), studentController.getStudentById);

// Routes accessible only by admin, principal, and hod
const adminRoles = ['admin', 'principal', 'hod'];

router.get('/create', hasRole(adminRoles), studentController.createStudentForm);
router.post('/create', hasRole(adminRoles), upload.single('photo'), studentController.createStudent);
router.get('/edit/:id', hasRole(adminRoles), studentController.editStudentForm);
router.post('/edit/:id', hasRole(adminRoles), upload.single('photo'), studentController.updateStudent);
router.post('/delete/:id', hasRole(adminRoles), studentController.deleteStudent);
router.post('/reset-password/:id', hasRole(adminRoles), studentController.resetPassword);

// Ajax route for sub-castes
router.get('/subcastes/:casteId', studentController.getSubcastesByCaste);

// Import/export routes
router.get('/import', hasRole(['admin']), studentController.importStudentsForm);
router.post('/import', hasRole(['admin']), csvUpload.single('csv'), studentController.importStudents);
router.get('/import/result', hasRole(['admin']), studentController.importResult);
router.get('/export', hasRole(adminRoles), studentController.exportStudents);

module.exports = router;