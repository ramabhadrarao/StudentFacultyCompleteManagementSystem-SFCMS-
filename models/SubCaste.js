const mongoose = require('mongoose');

const subCasteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  caste_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caste',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubCaste', subCasteSchema);
