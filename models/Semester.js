const mongoose = require('mongoose');
const semesterSchema = new mongoose.Schema({
  semester_name: { type: String, required: true },
  regulation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Regulation' }
}, { timestamps: true });
module.exports = mongoose.model('Semester', semesterSchema);
