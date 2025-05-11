const mongoose = require('mongoose');
const hostelAllocationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HostelRoom', required: true },
  allocation_date: { type: Date, required: true },
  vacating_date: Date,
  status: { type: String, enum: ['Active', 'Vacated', 'Transferred'], default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('HostelAllocation', hostelAllocationSchema);
