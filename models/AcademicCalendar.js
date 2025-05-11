const mongoose = require('mongoose');
const academicCalendarSchema = new mongoose.Schema({
  academic_year: { type: String, required: true },
  term_name: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_current: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
