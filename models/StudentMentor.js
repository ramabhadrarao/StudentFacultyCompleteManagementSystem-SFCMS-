const mongoose = require('mongoose');
const studentMentorSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model('StudentMentor', studentMentorSchema);
