const mongoose = require('mongoose');
const facultyTeachingAssignmentSchema = new mongoose.Schema({
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  academic_year: String,
  class_type: { type: String, enum: ['Theory', 'Lab', 'Tutorial'], default: 'Theory' },
  hours_per_week: Number,
  is_primary_faculty: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('FacultyTeachingAssignment', facultyTeachingAssignmentSchema);
