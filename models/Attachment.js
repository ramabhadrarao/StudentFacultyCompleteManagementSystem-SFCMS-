const mongoose = require('mongoose');
const attachmentSchema = new mongoose.Schema({
  file_path: { type: String, required: true },
  attachment_type: { type: String, enum: ['attachment', 'gallery_image'], required: true },
  visibility: { type: String, enum: ['show', 'hide'], default: 'show' }
}, { timestamps: true });
module.exports = mongoose.model('Attachment', attachmentSchema);
