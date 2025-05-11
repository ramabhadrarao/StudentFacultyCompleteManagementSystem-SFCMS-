const mongoose = require('mongoose');
const facultySchema = new mongoose.Schema({
  regdno: { type: String, unique: true, required: true },
  first_name: { type: String, required: true },
  last_name: String,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: Date,
  contact_no: String,
  email: { type: String, unique: true, required: true },
  address: String,
  join_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  edit_enabled: { type: Boolean, default: true },
  aadhar_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  pan_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  photo_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  visibility: { type: String, enum: ['show', 'hide'], default: 'show' }
}, { timestamps: true });
module.exports = mongoose.model('Faculty', facultySchema);
