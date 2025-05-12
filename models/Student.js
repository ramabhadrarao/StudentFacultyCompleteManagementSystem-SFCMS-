// models/Student.js
const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  // Basic Identification
  admission_no: { type: String, unique: true, required: true },
  regd_no: { type: String },
  
  // User Account Relation
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Personal Information
  name: { type: String, required: true },
  gender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gender', required: true },
  blood_group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodGroup' },
  email: { type: String },
  mobile: { type: String },
  father_name: { type: String },
  mother_name: { type: String },
  father_mobile: { type: String },
  mother_mobile: { type: String },
  aadhar: { type: String, unique: true, sparse: true },
  father_aadhar: { type: String, unique: true, sparse: true },
  mother_aadhar: { type: String, unique: true, sparse: true },
  address: { type: String },
  
  // Academic Details
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  
  // Demographics
  nationality_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Nationality', required: true },
  religion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Religion', required: true },
  student_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentType', required: true },
  caste_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Caste' },
  sub_caste_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCaste' },
  
  // Media
  photo: { type: String },
  
  // Student Freeze Status
  is_frozen: { type: Boolean, default: false },
  frozen_at: { type: Date },
  frozen_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  unfreeze_requests: [{
    requested_at: { type: Date, default: Date.now },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    processed_at: { type: Date },
    processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);