// routes/admin/users.js
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { isAuthenticated, hasRole } = require('../../middleware/auth');

// Apply middleware to all routes
router.use(isAuthenticated, hasRole(['admin']));

// User routes
router.get('/', userController.getUsers);
router.get('/create', userController.createUserForm);
router.post('/create', userController.createUser);
router.get('/view/:id', userController.getUserById);
router.get('/edit/:id', userController.editUserForm);
router.post('/edit/:id', userController.updateUser);
router.post('/delete/:id', userController.deleteUser);
router.post('/reset-password/:id', userController.resetPassword);

module.exports = router;