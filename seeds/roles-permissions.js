// seeds/roles-permissions.js
const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const bcrypt = require('bcrypt');

// Connect to MongoDB
async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
    });
    console.log('✅ MongoDB connected:', conn.connection.name);
  } catch (err) {
    console.error('[✘] MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Define default roles
const roles = [
  {
    role_name: 'admin',
    description: 'System Administrator with full access to all features',
  },
  {
    role_name: 'principal',
    description: 'Principal with access to all college data and management features',
  },
  {
    role_name: 'hod',
    description: 'Head of Department with access to department data and management features',
  },
  {
    role_name: 'faculty',
    description: 'Faculty member with access to teaching and student management features',
  },
  {
    role_name: 'student',
    description: 'Student with access to their academic information and limited features',
  },
];

// Define default permissions
const permissions = [
  // User Management Permissions
  {
    permission_name: 'user_view',
    description: 'View users in the system',
  },
  {
    permission_name: 'user_create',
    description: 'Create new users in the system',
  },
  {
    permission_name: 'user_edit',
    description: 'Edit existing users in the system',
  },
  {
    permission_name: 'user_delete',
    description: 'Delete users from the system',
  },
  
  // Role Management Permissions
  {
    permission_name: 'role_view',
    description: 'View roles in the system',
  },
  {
    permission_name: 'role_create',
    description: 'Create new roles in the system',
  },
  {
    permission_name: 'role_edit',
    description: 'Edit existing roles in the system',
  },
  {
    permission_name: 'role_delete',
    description: 'Delete roles from the system',
  },
  {
    permission_name: 'role_assign',
    description: 'Assign roles to users',
  },
  
  // Permission Management
  {
    permission_name: 'permission_view',
    description: 'View permissions in the system',
  },
  {
    permission_name: 'permission_create',
    description: 'Create new permissions in the system',
  },
  {
    permission_name: 'permission_edit',
    description: 'Edit existing permissions in the system',
  },
  {
    permission_name: 'permission_delete',
    description: 'Delete permissions from the system',
  },
  {
    permission_name: 'permission_assign',
    description: 'Assign permissions to roles',
  },
  
  // College Management
  {
    permission_name: 'college_view',
    description: 'View college information',
  },
  {
    permission_name: 'college_create',
    description: 'Create new college records',
  },
  {
    permission_name: 'college_edit',
    description: 'Edit college information',
  },
  {
    permission_name: 'college_delete',
    description: 'Delete college records',
  },
  
  // Department Management
  {
    permission_name: 'department_view',
    description: 'View department information',
  },
  {
    permission_name: 'department_create',
    description: 'Create new department records',
  },
  {
    permission_name: 'department_edit',
    description: 'Edit department information',
  },
  {
    permission_name: 'department_delete',
    description: 'Delete department records',
  },
  
  // Program Management
  {
    permission_name: 'program_view',
    description: 'View program information',
  },
  {
    permission_name: 'program_create',
    description: 'Create new program records',
  },
  {
    permission_name: 'program_edit',
    description: 'Edit program information',
  },
  {
    permission_name: 'program_delete',
    description: 'Delete program records',
  },
  
  // Student Management
  {
    permission_name: 'student_view',
    description: 'View student information',
  },
  {
    permission_name: 'student_create',
    description: 'Create new student records',
  },
  {
    permission_name: 'student_edit',
    description: 'Edit student information',
  },
  {
    permission_name: 'student_delete',
    description: 'Delete student records',
  },
  
  // Faculty Management
  {
    permission_name: 'faculty_view',
    description: 'View faculty information',
  },
  {
    permission_name: 'faculty_create',
    description: 'Create new faculty records',
  },
  {
    permission_name: 'faculty_edit',
    description: 'Edit faculty information',
  },
  {
    permission_name: 'faculty_delete',
    description: 'Delete faculty records',
  },
  
  // Attendance Management
  {
    permission_name: 'attendance_view',
    description: 'View attendance records',
  },
  {
    permission_name: 'attendance_mark',
    description: 'Mark attendance for students',
  },
  {
    permission_name: 'attendance_edit',
    description: 'Edit attendance records',
  },
  {
    permission_name: 'attendance_report',
    description: 'Generate attendance reports',
  },
  
  // System Settings
  {
    permission_name: 'settings_view',
    description: 'View system settings',
  },
  {
    permission_name: 'settings_edit',
    description: 'Edit system settings',
  },
  {
    permission_name: 'backup_manage',
    description: 'Manage system backups',
  },
];

// Define role-permission associations
const rolePermissionMap = {
  'admin': [
    'user_view', 'user_create', 'user_edit', 'user_delete',
    'role_view', 'role_create', 'role_edit', 'role_delete', 'role_assign',
    'permission_view', 'permission_create', 'permission_edit', 'permission_delete', 'permission_assign',
    'college_view', 'college_create', 'college_edit', 'college_delete',
    'department_view', 'department_create', 'department_edit', 'department_delete',
    'program_view', 'program_create', 'program_edit', 'program_delete',
    'student_view', 'student_create', 'student_edit', 'student_delete',
    'faculty_view', 'faculty_create', 'faculty_edit', 'faculty_delete',
    'attendance_view', 'attendance_mark', 'attendance_edit', 'attendance_report',
    'settings_view', 'settings_edit', 'backup_manage'
  ],
  'principal': [
    'user_view',
    'role_view',
    'permission_view',
    'college_view', 'college_edit',
    'department_view', 'department_create', 'department_edit', 'department_delete',
    'program_view', 'program_create', 'program_edit', 'program_delete',
    'student_view', 'student_create', 'student_edit',
    'faculty_view', 'faculty_create', 'faculty_edit',
    'attendance_view', 'attendance_report',
    'settings_view'
  ],
  'hod': [
    'user_view',
    'department_view',
    'program_view',
    'student_view', 'student_create', 'student_edit',
    'faculty_view',
    'attendance_view', 'attendance_mark', 'attendance_report'
  ],
  'faculty': [
    'student_view',
    'attendance_view', 'attendance_mark', 'attendance_report'
  ],
  'student': [
    'attendance_view'
  ]
};

// Create an admin user if none exists
const createAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        role: 'admin',
        is_active: true
      });
      
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('⚠️ Admin user already exists, skipping creation');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Seed data to database
const seedData = async () => {
  try {
    // Clear existing data
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});
    
    console.log('Cleared existing roles and permissions data');
    
    // Insert roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ ${createdRoles.length} roles inserted`);
    
    // Insert permissions
    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ ${createdPermissions.length} permissions inserted`);
    
    // Create role-permission associations
    const rolesMap = {};
    for (const role of createdRoles) {
      rolesMap[role.role_name] = role._id;
    }
    
    const permissionsMap = {};
    for (const permission of createdPermissions) {
      permissionsMap[permission.permission_name] = permission._id;
    }
    
    const rolePermissions = [];
    
    for (const roleName in rolePermissionMap) {
      const roleId = rolesMap[roleName];
      const permissionNames = rolePermissionMap[roleName];
      
      for (const permissionName of permissionNames) {
        const permissionId = permissionsMap[permissionName];
        if (roleId && permissionId) {
          rolePermissions.push({
            role_id: roleId,
            permission_id: permissionId
          });
        }
      }
    }
    
    const createdRolePermissions = await RolePermission.insertMany(rolePermissions);
    console.log(`✅ ${createdRolePermissions.length} role-permission associations created`);
    
    // Create admin user
    await createAdminUser();
    
    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
(async () => {
  await connectDB();
  await seedData();
  process.exit(0);
})();