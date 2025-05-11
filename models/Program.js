const mongoose = require('mongoose');
const programSchema = new mongoose.Schema({
  program_name: { type: String, required: true },
  program_code: { type: String, required: true, unique: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}, { timestamps: true });
module.exports = mongoose.model('Program', programSchema);
