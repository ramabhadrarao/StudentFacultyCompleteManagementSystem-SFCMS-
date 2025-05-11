const mongoose = require('mongoose');
const academicEventSchema = new mongoose.Schema({
  calendar_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicCalendar', required: true },
  event_name: { type: String, required: true },
  event_type: { type: String, enum: ['Holiday', 'Exam', 'Registration', 'Other'], required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  description: String
}, { timestamps: true });
module.exports = mongoose.model('AcademicEvent', academicEventSchema);
