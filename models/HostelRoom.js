const mongoose = require('mongoose');
const hostelRoomSchema = new mongoose.Schema({
  hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  room_number: { type: String, required: true },
  room_type: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory'], required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Partially Occupied', 'Fully Occupied', 'Under Maintenance'], default: 'Available' }
}, { timestamps: true });
module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
