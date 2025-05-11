const mongoose = require('mongoose');
const busRouteSchema = new mongoose.Schema({
  route_name: { type: String, required: true },
  route_number: { type: String, required: true },
  start_location: String,
  end_location: String,
  total_stops: Number,
  distance: Number
}, { timestamps: true });
module.exports = mongoose.model('BusRoute', busRouteSchema);
