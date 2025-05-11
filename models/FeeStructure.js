const mongoose = require('mongoose');
const feeStructureSchema = new mongoose.Schema({
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  fee_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeType', required: true },
  amount: { type: Number, required: true },
  due_date: { type: Date, required: true },
  academic_year: { type: String, required: true },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }
}, { timestamps: true });
module.exports = mongoose.model('FeeStructure', feeStructureSchema);
