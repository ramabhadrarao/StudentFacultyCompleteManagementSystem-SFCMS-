const mongoose = require('mongoose');
const busStopSchema = new mongoose.Schema({
  route_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute', required: true },
  stop_name: { type: String, required: true },
  stop_order: { type: Number, required: true },
  arrival_time: String,
  departure_time: String
}, { timestamps: true });
module.exports = mongoose.model('BusStop', busStopSchema);
