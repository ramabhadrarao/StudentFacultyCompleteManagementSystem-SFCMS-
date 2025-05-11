const mongoose = require('mongoose');
const transportAllocationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute', required: true },
  stop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BusStop', required: true },
  allocation_date: { type: Date, required: true },
  end_date: Date,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });
module.exports = mongoose.model('TransportAllocation', transportAllocationSchema);
