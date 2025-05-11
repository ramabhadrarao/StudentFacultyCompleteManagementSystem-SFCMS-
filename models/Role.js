const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
  role_name: { type: String, unique: true, required: true },
  description: String
});
module.exports = mongoose.model('Role', roleSchema);
