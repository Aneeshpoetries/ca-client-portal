const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['general', 'gst', 'itr', 'deadline', 'regulatory'],
    default: 'general',
  },
  isImportant: { type: Boolean, default: false },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

announcementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Announcement', announcementSchema);
