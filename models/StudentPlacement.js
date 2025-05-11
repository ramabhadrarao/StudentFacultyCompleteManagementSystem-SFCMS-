const mongoose = require('mongoose');
const studentPlacementSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  drive_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  registration_date: { type: Date, required: true },
  selection_status: { type: String, enum: ['Registered', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected', 'Offer Accepted', 'Offer Declined'], default: 'Registered' },
  offer_date: Date,
  joining_date: Date,
  package_offered: String,
  offer_letter_attachment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  remarks: String
}, { timestamps: true });
module.exports = mongoose.model('StudentPlacement', studentPlacementSchema);
