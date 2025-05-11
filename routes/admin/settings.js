// routes/admin/settings.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const systemSettingsController = require('../../controllers/systemSettingsController');
const { isAuthenticated, hasRole } = require('../../middleware/auth');

// Configure multer for backup upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `restore_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/gzip' || file.originalname.endsWith('.gz')) {
      cb(null, true);
    } else {
      cb(new Error('Only .gz backup files are allowed'));
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Apply middleware to all routes
router.use(isAuthenticated, hasRole(['admin']));

// General settings
router.get('/', systemSettingsController.getSettings);
router.post('/', systemSettingsController.updateSettings);

// System information
router.get('/system-info', systemSettingsController.getSystemInfo);

// Backup & restore
router.get('/backup', systemSettingsController.getBackups);
router.post('/backup', systemSettingsController.backupDatabase);
router.post('/restore', upload.single('backup_file'), systemSettingsController.restoreDatabase);
router.get('/backup/download/:file', systemSettingsController.downloadBackup);
router.post('/backup/delete/:file', systemSettingsController.deleteBackup);

module.exports = router;