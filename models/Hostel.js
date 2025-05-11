const mongoose = require('mongoose');
const hostelSchema = new mongoose.Schema({
  hostel_name: { type: String, required: true },
  hostel_type: { type: String, enum: ['Boys', 'Girls', 'Mixed'], required: true },
  warden_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  total_rooms: { type: Number, required: true },
  address: String
}, { timestamps: true });
module.exports = mongoose.model('Hostel', hostelSchema);
