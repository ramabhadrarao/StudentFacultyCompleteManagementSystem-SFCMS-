const mongoose = require('mongoose');
const facultyWorkloadSummarySchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  academic_year: String,
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  total_teaching_hours: Number,
  theory_hours: Number,
  lab_hours: Number,
  tutorial_hours: Number,
  administrative_hours: Number,
  research_hours: Number,
  total_workload_hours: Number
}, { timestamps: true });
module.exports = mongoose.model('FacultyWorkloadSummary', facultyWorkloadSummarySchema);
