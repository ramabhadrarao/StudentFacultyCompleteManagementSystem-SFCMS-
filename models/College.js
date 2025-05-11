// models/College.js
const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  college_code: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  principal_name: String,
  establishment_year: Number,
  is_active: {
    type: Boolean,
    default: true
  },
  logo: String,
  accreditation: {
    type: String,
    enum: ['NAAC-A++', 'NAAC-A+', 'NAAC-A', 'NAAC-B++', 'NAAC-B+', 'NAAC-B', 'NAAC-C', 'NBA', 'UGC', 'AICTE', 'Other', 'None'],
    default: 'None'
  },
  accreditation_valid_till: Date,
  affiliations: [{
    university: String,
    affiliation_number: String,
    valid_from: Date,
    valid_till: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);