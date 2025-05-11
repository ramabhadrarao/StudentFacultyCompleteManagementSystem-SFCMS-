// routes/master.js
const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const masterDataController = require('../controllers/masterDataController');
const collegeRoutes = require('./master/college');

// Apply authentication middleware to all routes
router.use(isAuthenticated, hasRole(['admin', 'principal']));

// College routes
router.use('/college', collegeRoutes);
// Gender routes
router.get('/gender', masterDataController.genderController.list);
router.post('/gender', masterDataController.genderController.create);
router.post('/gender/update/:id', masterDataController.genderController.update);
router.post('/gender/delete/:id', masterDataController.genderController.delete);
router.get('/gender/:id', masterDataController.genderController.getById);

// Nationality routes
router.get('/nationality', masterDataController.nationalityController.list);
router.post('/nationality', masterDataController.nationalityController.create);
router.post('/nationality/update/:id', masterDataController.nationalityController.update);
router.post('/nationality/delete/:id', masterDataController.nationalityController.delete);
router.get('/nationality/:id', masterDataController.nationalityController.getById);

// Religion routes
router.get('/religion', masterDataController.religionController.list);
router.post('/religion', masterDataController.religionController.create);
router.post('/religion/update/:id', masterDataController.religionController.update);
router.post('/religion/delete/:id', masterDataController.religionController.delete);
router.get('/religion/:id', masterDataController.religionController.getById);

// Student Type routes
router.get('/studenttype', masterDataController.studentTypeController.list);
router.post('/studenttype', masterDataController.studentTypeController.create);
router.post('/studenttype/update/:id', masterDataController.studentTypeController.update);
router.post('/studenttype/delete/:id', masterDataController.studentTypeController.delete);
router.get('/studenttype/:id', masterDataController.studentTypeController.getById);

// Caste routes
router.get('/caste', masterDataController.casteController.list);
router.post('/caste', masterDataController.casteController.create);
router.post('/caste/update/:id', masterDataController.casteController.update);
router.post('/caste/delete/:id', masterDataController.casteController.delete);
router.get('/caste/:id', masterDataController.casteController.getById);

// Sub Caste routes
router.get('/subcaste', masterDataController.subCasteController.list);
router.post('/subcaste', masterDataController.subCasteController.create);
router.post('/subcaste/update/:id', masterDataController.subCasteController.update);
router.post('/subcaste/delete/:id', masterDataController.subCasteController.delete);
router.get('/subcaste/:id', masterDataController.subCasteController.getById);

// Batch routes
router.get('/batch', masterDataController.batchController.list);
router.post('/batch', masterDataController.batchController.create);
router.post('/batch/update/:id', masterDataController.batchController.update);
router.post('/batch/delete/:id', masterDataController.batchController.delete);
router.get('/batch/:id', masterDataController.batchController.getById);

// Department routes
router.get('/department', masterDataController.departmentController.list);
router.post('/department', masterDataController.departmentController.create);
router.post('/department/update/:id', masterDataController.departmentController.update);
router.post('/department/delete/:id', masterDataController.departmentController.delete);
router.get('/department/:id', masterDataController.departmentController.getById);

// Program routes
router.get('/program', masterDataController.programController.list);
router.post('/program', masterDataController.programController.create);
router.post('/program/update/:id', masterDataController.programController.update);
router.post('/program/delete/:id', masterDataController.programController.delete);
router.get('/program/:id', masterDataController.programController.getById);

module.exports = router;