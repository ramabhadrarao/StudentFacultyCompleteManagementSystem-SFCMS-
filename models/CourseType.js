const mongoose = require('mongoose');
const courseTypeSchema = new mongoose.Schema({
  type_name: { type: String, required: true }
});
module.exports = mongoose.model('CourseType', courseTypeSchema);
