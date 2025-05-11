// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filterQuery = {};
    
    if (req.query.role) {
      filterQuery.role = req.query.role;
    }
    
    if (req.query.search) {
      filterQuery.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await User.countDocuments(filterQuery);
    
    // Get users with pagination
    const users = await User.find(filterQuery)
      .select('-password_hash')
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit);
    
    res.render('admin/users/index', {
      title: 'User Management',
      users,
      roles: ['student', 'faculty', 'hod', 'principal', 'admin'],
      selectedRole: req.query.role || '',
      searchTerm: req.query.search || '',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('User list error:', err);
    req.flash('error', 'Failed to load user list');
    res.redirect('/dashboard');
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    res.render('admin/users/view', {
      title: 'User Details',
      user
    });
  } catch (err) {
    console.error('User view error:', err);
    req.flash('error', 'Failed to load user details');
    res.redirect('/admin/users');
  }
};

// Create user form
exports.createUserForm = (req, res) => {
  res.render('admin/users/create', {
    title: 'Create User',
    roles: ['student', 'faculty', 'hod', 'principal', 'admin']
  });
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      req.flash('error', 'Username or email already exists');
      return res.redirect('/admin/users/create');
    }
    
    // Create new user
    const newUser = new User({
      username,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: role || 'student',
      is_active: true
    });
    
    await newUser.save();
    
    req.flash('success', 'User created successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('User creation error:', err);
    req.flash('error', 'Failed to create user');
    res.redirect('/admin/users/create');
  }
};

// Edit user form
exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    res.render('admin/users/edit', {
      title: 'Edit User',
      user,
      roles: ['student', 'faculty', 'hod', 'principal', 'admin']
    });
  } catch (err) {
    console.error('User edit form error:', err);
    req.flash('error', 'Failed to load user edit form');
    res.redirect('/admin/users');
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role, is_active } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Check for duplicate username/email
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        req.flash('error', 'Username or email already exists');
        return res.redirect(`/admin/users/edit/${req.params.id}`);
      }
    }
    
    // Update user
    user.username = username;
    user.email = email;
    user.role = role;
    user.is_active = is_active === 'true';
    
    await user.save();
    
    req.flash('success', 'User updated successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('User update error:', err);
    req.flash('error', 'Failed to update user');
    res.redirect(`/admin/users/edit/${req.params.id}`);
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('User deletion error:', err);
    req.flash('error', 'Failed to delete user');
    res.redirect('/admin/users');
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    
    // Update password
    user.password_hash = await bcrypt.hash(password, 10);
    await user.save();
    
    req.flash('success', 'Password reset successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Password reset error:', err);
    req.flash('error', 'Failed to reset password');
    res.redirect('/admin/users');
  }
};