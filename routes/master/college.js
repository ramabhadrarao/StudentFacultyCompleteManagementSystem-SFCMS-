// routes/master/college.js
const express = require('express');
const router = express.Router();
const collegeController = require('../../controllers/collegeController');
const { isAuthenticated, hasRole } = require('../../middleware/auth');

// Apply auth middleware to all routes
router.use(isAuthenticated, hasRole(['admin', 'principal']));

// College routes
router.get('/', collegeController.getColleges);
router.get('/create', collegeController.createCollegeForm);
router.post('/create', collegeController.upload.single('logo'), collegeController.createCollege);
router.get('/view/:id', collegeController.getCollegeById);
router.get('/edit/:id', collegeController.editCollegeForm);
router.post('/edit/:id', collegeController.upload.single('logo'), collegeController.updateCollege);
router.post('/delete/:id', collegeController.deleteCollege);

module.exports = router;