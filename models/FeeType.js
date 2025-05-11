const mongoose = require('mongoose');
const feeTypeSchema = new mongoose.Schema({
  fee_name: { type: String, required: true },
  description: String
}, { timestamps: true });
module.exports = mongoose.model('FeeType', feeTypeSchema);
