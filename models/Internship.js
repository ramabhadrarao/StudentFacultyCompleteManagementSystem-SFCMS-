const mongoose = require('mongoose');
const internshipSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  internship_type: { type: String, enum: ['Summer', 'Winter', 'Industrial Training', 'Research', 'Other'], required: true },
  position: String,
  stipend_amount: Number,
  supervisor_name: String,
  supervisor_contact: String,
  certificate_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  report_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  remarks: String
}, { timestamps: true });
module.exports = mongoose.model('Internship', internshipSchema);
