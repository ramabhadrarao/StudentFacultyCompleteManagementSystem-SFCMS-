// controllers/rolePermissionController.js
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const User = require('../models/User');
const UserRole = require('../models/UserRole');

// Get all roles with their permissions
exports.getRoles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    
    // Build search query
    const query = {};
    if (searchTerm) {
      query.$or = [
        { role_name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Count total roles for pagination
    const total = await Role.countDocuments(query);
    
    // Get roles with pagination
    const roles = await Role.find(query)
      .sort({ role_name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get all permissions
    const permissions = await Permission.find().sort({ permission_name: 1 });
    
    // Get role permissions
    const roleIds = roles.map(role => role._id);
    const rolePermissions = await RolePermission.find({
      role_id: { $in: roleIds }
    }).populate('permission_id');
    
    // Create role permissions map
    const rolePermissionsMap = {};
    rolePermissions.forEach(rp => {
      if (!rolePermissionsMap[rp.role_id]) {
        rolePermissionsMap[rp.role_id] = [];
      }
      rolePermissionsMap[rp.role_id].push(rp.permission_id);
    });
    
    // Render roles view
    res.render('admin/roles/index', {
      title: 'Role Management',
      roles,
      permissions,
      rolePermissionsMap,
      searchTerm,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Role list error:', err);
    req.flash('error', 'Failed to load role list');
    res.redirect('/dashboard');
  }
};

// Create role
exports.createRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;
    
    // Check if role already exists
    const existingRole = await Role.findOne({ role_name });
    if (existingRole) {
      req.flash('error', 'Role already exists');
      return res.redirect('/admin/roles');
    }
    
    // Create role
    const role = new Role({
      role_name,
      description
    });
    
    await role.save();
    
    req.flash('success', 'Role created successfully');
    res.redirect('/admin/roles');
  } catch (err) {
    console.error('Role creation error:', err);
    req.flash('error', 'Failed to create role');
    res.redirect('/admin/roles');
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;
    const roleId = req.params.id;
    
    // Check if role already exists
    const existingRole = await Role.findOne({
      role_name,
      _id: { $ne: roleId }
    });
    
    if (existingRole) {
      req.flash('error', 'Role name already exists');
      return res.redirect('/admin/roles');
    }
    
    // Update role
    await Role.findByIdAndUpdate(roleId, {
      role_name,
      description
    });
    
    req.flash('success', 'Role updated successfully');
    res.redirect('/admin/roles');
  } catch (err) {
    console.error('Role update error:', err);
    req.flash('error', 'Failed to update role');
    res.redirect('/admin/roles');
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    
    // Check if role is assigned to any user
    const userRoleCount = await UserRole.countDocuments({ role_id: roleId });
    if (userRoleCount > 0) {
      req.flash('error', 'Cannot delete role because it is assigned to users');
      return res.redirect('/admin/roles');
    }
    
    // Delete role permissions
    await RolePermission.deleteMany({ role_id: roleId });
    
    // Delete role
    await Role.findByIdAndDelete(roleId);
    
    req.flash('success', 'Role deleted successfully');
    res.redirect('/admin/roles');
  } catch (err) {
    console.error('Role deletion error:', err);
    req.flash('error', 'Failed to delete role');
    res.redirect('/admin/roles');
  }
};

// Get permissions
exports.getPermissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    
    // Build search query
    const query = {};
    if (searchTerm) {
      query.$or = [
        { permission_name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Count total permissions for pagination
    const total = await Permission.countDocuments(query);
    
    // Get permissions with pagination
    const permissions = await Permission.find(query)
      .sort({ permission_name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Render permissions view
    res.render('admin/permissions/index', {
      title: 'Permission Management',
      permissions,
      searchTerm,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Permission list error:', err);
    req.flash('error', 'Failed to load permission list');
    res.redirect('/dashboard');
  }
};

// Create permission
exports.createPermission = async (req, res) => {
  try {
    const { permission_name, description } = req.body;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ permission_name });
    if (existingPermission) {
      req.flash('error', 'Permission already exists');
      return res.redirect('/admin/permissions');
    }
    
    // Create permission
    const permission = new Permission({
      permission_name,
      description
    });
    
    await permission.save();
    
    req.flash('success', 'Permission created successfully');
    res.redirect('/admin/permissions');
  } catch (err) {
    console.error('Permission creation error:', err);
    req.flash('error', 'Failed to create permission');
    res.redirect('/admin/permissions');
  }
};

// Update permission
exports.updatePermission = async (req, res) => {
  try {
    const { permission_name, description } = req.body;
    const permissionId = req.params.id;
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({
      permission_name,
      _id: { $ne: permissionId }
    });
    
    if (existingPermission) {
      req.flash('error', 'Permission name already exists');
      return res.redirect('/admin/permissions');
    }
    
    // Update permission
    await Permission.findByIdAndUpdate(permissionId, {
      permission_name,
      description
    });
    
    req.flash('success', 'Permission updated successfully');
    res.redirect('/admin/permissions');
  } catch (err) {
    console.error('Permission update error:', err);
    req.flash('error', 'Failed to update permission');
    res.redirect('/admin/permissions');
  }
};

// Delete permission
exports.deletePermission = async (req, res) => {
  try {
    const permissionId = req.params.id;
    
    // Check if permission is assigned to any role
    const rolePermissionCount = await RolePermission.countDocuments({ permission_id: permissionId });
    if (rolePermissionCount > 0) {
      req.flash('error', 'Cannot delete permission because it is assigned to roles');
      return res.redirect('/admin/permissions');
    }
    
    // Delete permission
    await Permission.findByIdAndDelete(permissionId);
    
    req.flash('success', 'Permission deleted successfully');
    res.redirect('/admin/permissions');
  } catch (err) {
    console.error('Permission deletion error:', err);
    req.flash('error', 'Failed to delete permission');
    res.redirect('/admin/permissions');
  }
};

// Assign permissions to role
exports.assignPermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;
    
    // Delete existing role permissions
    await RolePermission.deleteMany({ role_id: roleId });
    
    // Create new role permissions
    if (permissions && permissions.length > 0) {
      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
      
      const rolePermissions = permissionArray.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));
      
      await RolePermission.insertMany(rolePermissions);
    }
    
    req.flash('success', 'Permissions assigned successfully');
    res.redirect('/admin/roles');
  } catch (err) {
    console.error('Permission assignment error:', err);
    req.flash('error', 'Failed to assign permissions');
    res.redirect('/admin/roles');
  }
};

// Get user roles
exports.getUserRoles = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Get all roles
    const roles = await Role.find().sort({ role_name: 1 });
    
    // Get user roles
    const userRoles = await UserRole.find({ user_id: userId }).populate('role_id');
    
    // Create user roles map
    const userRolesMap = {};
    userRoles.forEach(ur => {
      userRolesMap[ur.role_id._id] = true;
    });
    
    // Render user roles view
    res.render('admin/users/roles', {
      title: 'User Roles',
      user,
      roles,
      userRolesMap
    });
  } catch (err) {
    console.error('User roles error:', err);
    req.flash('error', 'Failed to load user roles');
    res.redirect('/admin/users');
  }
};

// Assign roles to user
exports.assignUserRoles = async (req, res) => {
  try {
    const userId = req.params.id;
    const { roles } = req.body;
    
    // Delete existing user roles
    await UserRole.deleteMany({ user_id: userId });
    
    // Create new user roles
    if (roles && roles.length > 0) {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      const userRoles = roleArray.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }));
      
      await UserRole.insertMany(userRoles);
    }
    
    req.flash('success', 'Roles assigned successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Role assignment error:', err);
    req.flash('error', 'Failed to assign roles');
    res.redirect('/admin/users');
  }
};

// Helper function to check permission
exports.hasPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.session.user) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/login');
      }
      
      // Get user
      const user = await User.findById(req.session.user.id);
      if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/login');
      }
      
      // Check if user is admin (has all permissions)
      if (user.role === 'admin') {
        return next();
      }
      
      // Get user roles
      const userRoles = await UserRole.find({ user_id: user._id });
      if (!userRoles || userRoles.length === 0) {
        req.flash('error', 'You do not have permission to access this page');
        return res.redirect('/dashboard');
      }
      
      // Get role IDs
      const roleIds = userRoles.map(ur => ur.role_id);
      
      // Find permission
      const permission = await Permission.findOne({ permission_name: permissionName });
      if (!permission) {
        req.flash('error', 'Permission not found');
        return res.redirect('/dashboard');
      }
      
      // Check if roles have permission
      const rolePermission = await RolePermission.findOne({
        role_id: { $in: roleIds },
        permission_id: permission._id
      });
      
      if (!rolePermission) {
        req.flash('error', 'You do not have permission to access this page');
        return res.redirect('/dashboard');
      }
      
      next();
    } catch (err) {
      console.error('Permission check error:', err);
      req.flash('error', 'An error occurred while checking permissions');
      res.redirect('/dashboard');
    }
  };
};

// Add this method to the rolePermissionController.js to support permissions fetching for roles

// Get permissions by role ID
exports.getRolePermissions = async (req, res) => {
  try {
    const roleId = req.params.id;
    
    // Get role
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Get role permissions
    const rolePermissions = await RolePermission.find({ role_id: roleId })
      .populate('permission_id');
    
    // Extract permissions
    const permissions = rolePermissions.map(rp => rp.permission_id);
    
    res.json({
      success: true,
      permissions
    });
  } catch (err) {
    console.error('Role permissions error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load role permissions'
    });
  }
};