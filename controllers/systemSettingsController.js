// controllers/systemSettingsController.js
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Define a Settings model if you don't have one already
// This is a simple schema using a key-value pattern for flexible settings
const Settings = mongoose.model('Settings', new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  description: String,
  category: { type: String, default: 'general' },
  is_system: { type: Boolean, default: false }
}));

// Initialize system settings
exports.initializeSettings = async () => {
  try {
    // Check if settings exist
    const settingsCount = await Settings.countDocuments();
    
    if (settingsCount === 0) {
      // Define default settings
      const defaultSettings = [
        {
          key: 'site_name',
          value: 'College ERP System',
          description: 'Name of the site or institution',
          category: 'general',
          is_system: true
        },
        {
          key: 'site_logo',
          value: '',
          description: 'Site logo path',
          category: 'general',
          is_system: false
        },
        {
          key: 'contact_email',
          value: 'admin@college.edu',
          description: 'Primary contact email',
          category: 'contact',
          is_system: false
        },
        {
          key: 'contact_phone',
          value: '',
          description: 'Primary contact phone',
          category: 'contact',
          is_system: false
        },
        {
          key: 'institute_address',
          value: '',
          description: 'Institute address',
          category: 'contact',
          is_system: false
        },
        {
          key: 'academic_year',
          value: '2024-2025',
          description: 'Current academic year',
          category: 'academic',
          is_system: true
        },
        {
          key: 'current_semester',
          value: '',
          description: 'Current semester ID',
          category: 'academic',
          is_system: true
        },
        {
          key: 'attendance_threshold',
          value: 75,
          description: 'Minimum attendance percentage required',
          category: 'academic',
          is_system: true
        },
        {
          key: 'enable_email_notifications',
          value: false,
          description: 'Enable email notifications',
          category: 'notifications',
          is_system: true
        },
        {
          key: 'smtp_host',
          value: '',
          description: 'SMTP host for email sending',
          category: 'email',
          is_system: true
        },
        {
          key: 'smtp_port',
          value: 587,
          description: 'SMTP port',
          category: 'email',
          is_system: true
        },
        {
          key: 'smtp_username',
          value: '',
          description: 'SMTP username',
          category: 'email',
          is_system: true
        },
        {
          key: 'smtp_password',
          value: '',
          description: 'SMTP password',
          category: 'email',
          is_system: true
        },
        {
          key: 'enable_student_registration',
          value: true,
          description: 'Allow students to self-register',
          category: 'registration',
          is_system: true
        },
        {
          key: 'max_upload_size',
          value: 5,
          description: 'Maximum file upload size in MB',
          category: 'system',
          is_system: true
        },
        {
          key: 'theme',
          value: 'default',
          description: 'UI theme',
          category: 'appearance',
          is_system: false
        }
      ];
      
      // Insert default settings
      await Settings.insertMany(defaultSettings);
      console.log('System settings initialized');
    }
  } catch (err) {
    console.error('Error initializing settings:', err);
  }
};

// Get all settings
exports.getSettings = async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const query = category !== 'all' ? { category } : {};
    
    // Get settings grouped by category
    const settings = await Settings.find(query).sort({ category: 1, key: 1 });
    
    // Group settings by category
    const groupedSettings = {};
    settings.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = [];
      }
      groupedSettings[setting.category].push(setting);
    });
    
    // Get all categories
    const categories = await Settings.distinct('category');
    
    // Render settings view
    res.render('admin/settings/index', {
      title: 'System Settings',
      groupedSettings,
      categories,
      currentCategory: category
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    req.flash('error', 'Failed to load settings');
    res.redirect('/dashboard');
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Update each setting
    for (const key in settings) {
      if (key !== '_method') {
        // Handle boolean values (checkboxes)
        let value = settings[key];
        if (value === 'on') {
          value = true;
        } else if (value === 'off') {
          value = false;
        } else if (!isNaN(value) && value !== '') {
          // Convert numeric strings to numbers
          value = Number(value);
        }
        
        await Settings.updateOne({ key }, { $set: { value } });
      }
    }
    
    req.flash('success', 'Settings updated successfully');
    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Error updating settings:', err);
    req.flash('error', 'Failed to update settings');
    res.redirect('/admin/settings');
  }
};

// Get system information
exports.getSystemInfo = async (req, res) => {
  try {
    // Get Node.js information
    const nodeVersion = process.version;
    const platform = process.platform;
    const architecture = process.arch;
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Get MongoDB information
    const mongoStatus = await mongoose.connection.db.admin().serverStatus();
    
    // Get disk usage
    const diskUsage = await getDiskUsage();
    
    // Get package information
    const packageInfo = require('../../package.json');
    
    // Render system info view
    res.render('admin/settings/system-info', {
      title: 'System Information',
      nodeInfo: {
        version: nodeVersion,
        platform,
        architecture,
        memoryUsage: {
          rss: formatBytes(memoryUsage.rss),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          heapUsed: formatBytes(memoryUsage.heapUsed),
          external: formatBytes(memoryUsage.external)
        },
        uptime: formatUptime(uptime)
      },
      mongoInfo: {
        version: mongoStatus.version,
        uptime: formatUptime(mongoStatus.uptime),
        connections: mongoStatus.connections,
        storageEngine: mongoStatus.storageEngine.name
      },
      diskUsage,
      appInfo: {
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        dependencies: Object.keys(packageInfo.dependencies).length
      }
    });
  } catch (err) {
    console.error('Error fetching system info:', err);
    req.flash('error', 'Failed to load system information');
    res.redirect('/admin/settings');
  }
};

// Backup database
exports.backupDatabase = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const backupPath = path.join(backupDir, `backup_${timestamp}.gz`);
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get MongoDB connection URI from environment
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_db';
    const dbName = mongoUri.split('/').pop().split('?')[0];
    
    // Create backup command
    const cmd = `mongodump --uri="${mongoUri}" --gzip --archive=${backupPath}`;
    
    // Execute backup command
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup error:', error);
        req.flash('error', 'Database backup failed');
        return res.redirect('/admin/settings/backup');
      }
      
      console.log('Backup success:', stdout);
      
      // Get backup file size
      const stats = fs.statSync(backupPath);
      const fileSize = formatBytes(stats.size);
      
      req.flash('success', `Database backup created successfully (${fileSize})`);
      res.redirect('/admin/settings/backup');
    });
  } catch (err) {
    console.error('Backup error:', err);
    req.flash('error', 'Failed to backup database');
    res.redirect('/admin/settings/backup');
  }
};

// Restore database
exports.restoreDatabase = async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error', 'Please upload a backup file');
      return res.redirect('/admin/settings/backup');
    }
    
    const backupPath = req.file.path;
    
    // Get MongoDB connection URI from environment
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/college_db';
    
    // Create restore command
    const cmd = `mongorestore --uri="${mongoUri}" --gzip --archive=${backupPath}`;
    
    // Execute restore command
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Restore error:', error);
        req.flash('error', 'Database restore failed');
        return res.redirect('/admin/settings/backup');
      }
      
      console.log('Restore success:', stdout);
      
      // Delete temporary file
      fs.unlinkSync(backupPath);
      
      req.flash('success', 'Database restored successfully');
      res.redirect('/admin/settings/backup');
    });
  } catch (err) {
    console.error('Restore error:', err);
    req.flash('error', 'Failed to restore database');
    res.redirect('/admin/settings/backup');
  }
};

// Get backup files
exports.getBackups = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Get backup files
    const files = fs.readdirSync(backupDir);
    
    // Get file stats
    const backups = files
      .filter(file => file.endsWith('.gz'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          name: file,
          path: filePath,
          size: formatBytes(stats.size),
          date: stats.mtime
        };
      })
      .sort((a, b) => b.date - a.date); // Sort by date descending
    
    // Render backup view
    res.render('admin/settings/backup', {
      title: 'Database Backup & Restore',
      backups
    });
  } catch (err) {
    console.error('Error fetching backups:', err);
    req.flash('error', 'Failed to load backup list');
    res.redirect('/admin/settings');
  }
};

// Download backup file
exports.downloadBackup = async (req, res) => {
  try {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, '../../backups', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      req.flash('error', 'Backup file not found');
      return res.redirect('/admin/settings/backup');
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/gzip');
    
    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    req.flash('error', 'Failed to download backup file');
    res.redirect('/admin/settings/backup');
  }
};

// Delete backup file
exports.deleteBackup = async (req, res) => {
  try {
    const fileName = req.params.file;
    const filePath = path.join(__dirname, '../../backups', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      req.flash('error', 'Backup file not found');
      return res.redirect('/admin/settings/backup');
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    req.flash('success', 'Backup file deleted successfully');
    res.redirect('/admin/settings/backup');
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error', 'Failed to delete backup file');
    res.redirect('/admin/settings/backup');
  }
};

// Helper Functions

// Format bytes to human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format uptime to human-readable format
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

// Get disk usage
async function getDiskUsage() {
  return new Promise((resolve, reject) => {
    if (process.platform === 'win32') {
      // Windows
      exec('wmic logicaldisk get size,freespace,caption', (error, stdout, stderr) => {
        if (error) {
          console.error('Disk usage error:', error);
          return resolve([]);
        }
        
        const lines = stdout.trim().split('\n').slice(1);
        const drives = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 3) {
            const drive = parts[0];
            const freeSpace = parseInt(parts[1]);
            const totalSize = parseInt(parts[2]);
            const usedSpace = totalSize - freeSpace;
            const usedPercent = ((usedSpace / totalSize) * 100).toFixed(1);
            
            drives.push({
              drive,
              total: formatBytes(totalSize),
              used: formatBytes(usedSpace),
              free: formatBytes(freeSpace),
              usedPercent
            });
          }
        });
        
        resolve(drives);
      });
    } else {
      // Linux/Unix
      exec('df -h', (error, stdout, stderr) => {
        if (error) {
          console.error('Disk usage error:', error);
          return resolve([]);
        }
        
        const lines = stdout.trim().split('\n').slice(1);
        const drives = [];
        
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 6) {
            const filesystem = parts[0];
            const size = parts[1];
            const used = parts[2];
            const available = parts[3];
            const usedPercent = parts[4].replace('%', '');
            const mountpoint = parts[5];
            
            drives.push({
              drive: mountpoint,
              filesystem,
              total: size,
              used,
              free: available,
              usedPercent
            });
          }
        });
        
        resolve(drives);
      });
    }
  });
}

// Get a setting by key
exports.getSetting = async (key) => {
  try {
    const setting = await Settings.findOne({ key });
    return setting ? setting.value : null;
  } catch (err) {
    console.error(`Error getting setting ${key}:`, err);
    return null;
  }
};

// Update a setting by key
exports.updateSetting = async (key, value) => {
  try {
    await Settings.updateOne({ key }, { $set: { value } });
    return true;
  } catch (err) {
    console.error(`Error updating setting ${key}:`, err);
    return false;
  }
};