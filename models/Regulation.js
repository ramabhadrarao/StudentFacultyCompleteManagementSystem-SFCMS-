const mongoose = require('mongoose');
const regulationSchema = new mongoose.Schema({
  regulation_name: { type: String, required: true },
  regulation_code: { type: String, required: true, unique: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }
}, { timestamps: true });
module.exports = mongoose.model('Regulation', regulationSchema);
