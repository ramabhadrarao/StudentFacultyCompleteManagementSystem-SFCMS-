// routes/admin/roles.js
const express = require('express');
const router = express.Router();
const rolePermissionController = require('../../controllers/rolePermissionController');
const { isAuthenticated, hasRole } = require('../../middleware/auth');

// Apply middleware to all routes
router.use(isAuthenticated, hasRole(['admin']));

// Role routes
router.get('/', rolePermissionController.getRoles);
router.post('/', rolePermissionController.createRole);
router.post('/update/:id', rolePermissionController.updateRole);
router.post('/delete/:id', rolePermissionController.deleteRole);
router.post('/assign-permissions/:id', rolePermissionController.assignPermissions);

// Permission routes
router.get('/permissions', rolePermissionController.getPermissions);
router.post('/permissions', rolePermissionController.createPermission);
router.post('/permissions/update/:id', rolePermissionController.updatePermission);
router.post('/permissions/delete/:id', rolePermissionController.deletePermission);
// Get role permissions (for AJAX)
router.get('/permissions/:id', rolePermissionController.getRolePermissions);
// User role routes
router.get('/user/:id', rolePermissionController.getUserRoles);
router.post('/user/:id', rolePermissionController.assignUserRoles);

module.exports = router;