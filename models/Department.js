const mongoose = require('mongoose');
const departmentSchema = new mongoose.Schema({
  department_name: { type: String, required: true },
  department_code: { type: String, required: true, unique: true },
  college_id: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }
}, { timestamps: true });
module.exports = mongoose.model('Department', departmentSchema);
