const mongoose = require('mongoose');
const enhancedAttendanceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  attendance_date: { type: Date, required: true },
  period_number: { type: Number, required: true },
  class_type: { type: String, enum: ['Theory', 'Lab', 'Tutorial'], default: 'Theory' },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'On Duty', 'Medical Leave'], default: 'Absent' },
  marked_by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  marked_datetime: { type: Date, required: true },
  last_modified_by_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String
}, { timestamps: true });
module.exports = mongoose.model('EnhancedAttendance', enhancedAttendanceSchema);
