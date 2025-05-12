// models/Branch.js
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  branch_name: { type: String, required: true },
  branch_code: { type: String, required: true, unique: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);