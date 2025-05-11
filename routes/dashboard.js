// routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard home - apply authentication middleware
router.get('/', isAuthenticated, dashboardController.index);

module.exports = router;