const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  admission_no: { type: String, unique: true, required: true },
  regd_no: String,
  name: { type: String, required: true },
  gender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gender', required: true },
  email: String,
  mobile: String,
  father_name: String,
  mother_name: String,
  aadhar: { type: String, unique: true },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  photo: String,
  nationality_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Nationality' },
  religion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Religion' },
  student_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentType' },
  caste_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Caste' },
  sub_caste_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCaste' }
}, { timestamps: true });
module.exports = mongoose.model('Student', studentSchema);
