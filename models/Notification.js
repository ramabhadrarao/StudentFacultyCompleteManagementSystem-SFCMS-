const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  notification_type: { type: String, enum: ['Alert', 'Information', 'Warning', 'Success'], default: 'Information' },
  related_entity: String,
  related_entity_id: mongoose.Schema.Types.ObjectId,
  is_read: { type: Boolean, default: false },
  read_at: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
