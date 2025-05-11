const mongoose = require('mongoose');
const counselingSessionSchema = new mongoose.Schema({
  mentorship_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentMentor', required: true },
  session_date: { type: Date, required: true },
  session_time: { type: String, required: true },
  session_topic: String,
  academic_performance: String,
  attendance_issues: String,
  behavioral_observations: String,
  recommendations: String,
  action_items: String,
  follow_up_date: Date
}, { timestamps: true });
module.exports = mongoose.model('CounselingSession', counselingSessionSchema);
