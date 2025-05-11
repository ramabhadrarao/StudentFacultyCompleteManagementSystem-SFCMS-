const mongoose = require('mongoose');
const attendanceShortageAlertSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  current_percentage: Number,
  required_percentage: { type: Number, default: 75.00 },
  alert_date: { type: Date, required: true },
  notification_sent: { type: Boolean, default: false },
  resolved: { type: Boolean, default: false },
  resolution_remarks: String
}, { timestamps: true });
module.exports = mongoose.model('AttendanceShortageAlert', attendanceShortageAlertSchema);
