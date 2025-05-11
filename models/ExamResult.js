const mongoose = require('mongoose');
const examResultSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  exam_type: { type: String, enum: ['Internal-1', 'Internal-2', 'Mid-Term', 'End-Term', 'Supplementary'], required: true },
  academic_year: String,
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  marks_obtained: Number,
  max_marks: Number,
  percentage: Number,
  grade: String,
  grade_points: Number,
  attempt_number: { type: Number, default: 1 },
  is_pass: { type: Boolean, default: true },
  examination_date: Date,
  result_date: Date,
  remarks: String
}, { timestamps: true });
module.exports = mongoose.model('ExamResult', examResultSchema);
