const mongoose = require('mongoose');
const placementDriveSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  drive_title: { type: String, required: true },
  drive_date: { type: Date, required: true },
  eligibility_criteria: String,
  job_description: String,
  position_offered: String,
  package_offered: String,
  location: String,
  registration_deadline: Date
}, { timestamps: true });
module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
