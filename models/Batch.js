const mongoose = require('mongoose');
const batchSchema = new mongoose.Schema({
  batch_name: { type: String, required: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  start_year: { type: Number, required: true },
  end_year: { type: Number, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Batch', batchSchema);