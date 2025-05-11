// models/User.js - Add password reset fields
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'hod', 'principal', 'admin'],
    default: 'student'
  },
  is_active: { type: Boolean, default: true },
  last_login: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);