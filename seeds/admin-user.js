// seeds/admin-user.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Create default admin user
const createAdmin = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists, skipping...');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@college.edu',
      password_hash: hashedPassword,
      role: 'admin',
      is_active: true,
      last_login: new Date()
    });
    
    await admin.save();
    console.log('Admin user created successfully');
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

// Create test users for each role
const createTestUsers = async () => {
  try {
    const roles = ['student', 'faculty', 'hod', 'principal'];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (const role of roles) {
      // Check if user already exists
      const userExists = await User.findOne({ username: role });
      
      if (userExists) {
        console.log(`Test user '${role}' already exists, skipping...`);
        continue;
      }
      
      // Create user
      const user = new User({
        username: role,
        email: `${role}@college.edu`,
        password_hash: hashedPassword,
        role,
        is_active: true,
        last_login: new Date()
      });
      
      await user.save();
      console.log(`Test user '${role}' created successfully`);
    }
  } catch (err) {
    console.error('Error creating test users:', err);
  }
};

// Run all seed functions
const seedUsers = async () => {
  await connectDB();
  await createAdmin();
  await createTestUsers();
  console.log('User seeding completed');
  process.exit(0);
};

// Execute the seeding if this file is run directly
if (require.main === module) {
  seedUsers();
}

module.exports = {
  seedUsers,
  createAdmin,
  createTestUsers
};