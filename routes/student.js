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

// Define studentController methods if they don't exist
// This is temporary and should be replaced with proper implementation later
if (!studentController.getStudents) {
  studentController.getStudents = (req, res) => {
    res.render('students/index', {
      title: 'Student Management',
      students: [],
      batches: [],
      selectedBatch: '',
      searchName: '',
      searchAdmission: '',
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      }
    });
  };
}

if (!studentController.getStudentById) {
  studentController.getStudentById = (req, res) => {
    res.render('students/view', {
      title: 'Student Details',
      student: {}
    });
  };
}

if (!studentController.createStudentForm) {
  studentController.createStudentForm = (req, res) => {
    res.render('students/create', {
      title: 'Add Student',
      batches: [],
      genders: [],
      nationalities: [],
      religions: [],
      studentTypes: [],
      castes: [],
      subcastes: []
    });
  };
}

if (!studentController.createStudent) {
  studentController.createStudent = (req, res) => {
    req.flash('success', 'Student would be created here');
    res.redirect('/students');
  };
}

if (!studentController.editStudentForm) {
  studentController.editStudentForm = (req, res) => {
    res.render('students/edit', {
      title: 'Edit Student',
      student: {},
      batches: [],
      genders: [],
      nationalities: [],
      religions: [],
      studentTypes: [],
      castes: [],
      subcastes: []
    });
  };
}

if (!studentController.updateStudent) {
  studentController.updateStudent = (req, res) => {
    req.flash('success', 'Student would be updated here');
    res.redirect('/students');
  };
}

if (!studentController.deleteStudent) {
  studentController.deleteStudent = (req, res) => {
    req.flash('success', 'Student would be deleted here');
    res.redirect('/students');
  };
}

if (!studentController.importStudentsForm) {
  studentController.importStudentsForm = (req, res) => {
    res.render('students/import', {
      title: 'Import Students'
    });
  };
}

if (!studentController.importStudents) {
  studentController.importStudents = (req, res) => {
    req.flash('success', 'Students would be imported here');
    res.redirect('/students/import/result');
  };
}

if (!studentController.importResult) {
  studentController.importResult = (req, res) => {
    res.render('students/import-result', {
      title: 'Import Results',
      errors: []
    });
  };
}

if (!studentController.exportStudents) {
  studentController.exportStudents = (req, res) => {
    res.send('Student export functionality would be here');
  };
}

if (!studentController.resetPassword) {
  studentController.resetPassword = (req, res) => {
    req.flash('success', 'Password would be reset here');
    res.redirect('/students');
  };
}

if (!studentController.getSubcastesByCaste) {
  studentController.getSubcastesByCaste = (req, res) => {
    res.json([]);
  };
}

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