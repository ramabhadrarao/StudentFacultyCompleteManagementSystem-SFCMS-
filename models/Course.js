const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
  course_code: { type: String, unique: true, required: true },
  course_name: { type: String, required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  regulation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Regulation', required: true },
  course_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseType', required: true },
  credits: Number
}, { timestamps: true });
module.exports = mongoose.model('Course', courseSchema);
