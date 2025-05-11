const mongoose = require('mongoose');
const studentFeePaymentSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fee_structure_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
  amount_paid: { type: Number, required: true },
  payment_date: { type: Date, required: true },
  payment_method: { type: String, enum: ['Cash', 'Online', 'Cheque', 'DD'], required: true },
  transaction_id: String,
  receipt_number: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  remarks: String
}, { timestamps: true });
module.exports = mongoose.model('StudentFeePayment', studentFeePaymentSchema);
