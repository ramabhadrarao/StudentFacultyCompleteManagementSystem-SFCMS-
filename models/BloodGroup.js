// models/BloodGroup.js
const mongoose = require('mongoose');

const bloodGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BloodGroup', bloodGroupSchema);