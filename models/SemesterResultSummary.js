const mongoose = require('mongoose');
const semesterResultSummarySchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academic_year: String,
  total_credits: Number,
  credits_earned: Number,
  sgpa: Number,
  cgpa: Number,
  class_awarded: { type: String, enum: ['First Class with Distinction', 'First Class', 'Second Class', 'Pass Class', 'Fail'] },
  is_promoted: { type: Boolean, default: true },
  result_date: Date
}, { timestamps: true });
module.exports = mongoose.model('SemesterResultSummary', semesterResultSummarySchema);
