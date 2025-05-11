// scripts/create-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@college.edu' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      mongoose.disconnect();
      return;
    }

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      username: 'admin',
      email: 'admin@college.edu',
      password_hash: passwordHash,
      role: 'admin',
      is_active: true,
      last_login: new Date()
    });

    await admin.save();
    console.log('Admin user created successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
}

createAdmin();