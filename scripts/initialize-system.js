// scripts/initialize-system.js
require('dotenv').config();
const mongoose = require('mongoose');
const systemSettingsController = require('../controllers/systemSettingsController');
const seedUsers = require('../seeds/admin-user').seedUsers;
const seedLookupData = require('../seeds/lookup-data');
const fs = require('fs');
const path = require('path');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected:', conn.connection.name);
    return conn;
  } catch (err) {
    console.error('[✘] MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Create required directories
const createDirectories = () => {
  const directories = [
    './public/uploads',
    './public/uploads/students',
    './public/uploads/faculty',
    './public/uploads/documents',
    './public/uploads/certificates',
    './backups',
    './temp'
  ];

  directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dirPath}`);
    } else {
      console.log(`⚠️ Directory already exists: ${dirPath}`);
    }
  });
};

// Create default permissions
const createDefaultPermissions = async () => {
  try {
    // Define Permission model
    const Permission = mongoose.model('Permission');
    
    // Define default permissions
    const defaultPermissions = [
      { permission_name: 'view_students', description: 'View student records' },
      { permission_name: 'create_students', description: 'Create new students' },
      { permission_name: 'edit_students', description: 'Edit student records' },
      { permission_name: 'delete_students', description: 'Delete student records' },
      
      { permission_name: 'view_faculty', description: 'View faculty records' },
      { permission_name: 'create_faculty', description: 'Create new faculty' },
      { permission_name: 'edit_faculty', description: 'Edit faculty records' },
      { permission_name: 'delete_faculty', description: 'Delete faculty records' },
      
      { permission_name: 'view_users', description: 'View user accounts' },
      { permission_name: 'create_users', description: 'Create user accounts' },
      { permission_name: 'edit_users', description: 'Edit user accounts' },
      { permission_name: 'delete_users', description: 'Delete user accounts' },
      
      { permission_name: 'view_roles', description: 'View role definitions' },
      { permission_name: 'manage_roles', description: 'Manage roles and permissions' },
      
      { permission_name: 'view_settings', description: 'View system settings' },
      { permission_name: 'manage_settings', description: 'Manage system settings' },
      
      { permission_name: 'view_master_data', description: 'View master data' },
      { permission_name: 'manage_master_data', description: 'Manage master data' },
      
      { permission_name: 'backup_restore', description: 'Perform backup and restore operations' }
    ];
    
    // Check if permissions exist
    const count = await Permission.countDocuments();
    
    if (count === 0) {
      // Create permissions
      await Permission.insertMany(defaultPermissions);
      console.log('✅ Default permissions created');
    } else {
      console.log('⚠️ Permissions already exist, skipping creation');
    }
  } catch (err) {
    console.error('[✘] Error creating default permissions:', err);
  }
};

// Create default roles with permissions
const createDefaultRoles = async () => {
  try {
    // Define models
    const Role = mongoose.model('Role');
    const Permission = mongoose.model('Permission');
    const RolePermission = mongoose.model('RolePermission');
    
    // Define default roles
    const defaultRoles = [
      { 
        role_name: 'admin',
        description: 'Administrator with full access'
      },
      { 
        role_name: 'principal',
        description: 'School principal with high-level access'
      },
      { 
        role_name: 'hod',
        description: 'Department head with departmental access'
      },
      { 
        role_name: 'faculty',
        description: 'Faculty member with teaching access'
      },
      { 
        role_name: 'student',
        description: 'Student with limited access'
      }
    ];
    
    // Check if roles exist
    const roleCount = await Role.countDocuments();
    
    if (roleCount === 0) {
      // Create roles
      for (const roleData of defaultRoles) {
        const role = await Role.create(roleData);
        
        // Assign all permissions to admin
        if (roleData.role_name === 'admin') {
          const permissions = await Permission.find();
          
          for (const permission of permissions) {
            await RolePermission.create({
              role_id: role._id,
              permission_id: permission._id
            });
          }
        }
        
        // Assign specific permissions to principal
        if (roleData.role_name === 'principal') {
          const principalPermissions = await Permission.find({
            permission_name: { 
              $in: [
                'view_students', 'view_faculty', 'view_master_data',
                'manage_master_data', 'view_roles', 'view_settings'
              ]
            }
          });
          
          for (const permission of principalPermissions) {
            await RolePermission.create({
              role_id: role._id,
              permission_id: permission._id
            });
          }
        }
        
        // Assign limited permissions to other roles
        // For HOD, faculty, and student roles
      }
      
      console.log('✅ Default roles created with permissions');
    } else {
      console.log('⚠️ Roles already exist, skipping creation');
    }
  } catch (err) {
    console.error('[✘] Error creating default roles:', err);
  }
};

// Main function to initialize system
const initializeSystem = async () => {
  try {
    console.log('Starting system initialization...');
    
    // Connect to database
    await connectDB();
    
    // Create required directories
    createDirectories();
    
    // Seed admin user and test users
    await seedUsers();
    
    // Seed lookup data
    await seedLookupData();
    
    // Initialize system settings
    await systemSettingsController.initializeSettings();
    
    // Create default permissions
    await createDefaultPermissions();
    
    // Create default roles with permissions
    await createDefaultRoles();
    
    console.log('✅ System initialization completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('[✘] System initialization failed:', err);
    process.exit(1);
  }
};

// Run initialization
initializeSystem();