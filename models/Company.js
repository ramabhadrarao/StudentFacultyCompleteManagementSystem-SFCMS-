const mongoose = require('mongoose');
const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  industry: String,
  website: String,
  address: String,
  contact_person: String,
  contact_email: String,
  contact_phone: String
}, { timestamps: true });
module.exports = mongoose.model('Company', companySchema);
