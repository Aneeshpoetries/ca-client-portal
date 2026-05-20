const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Client name is required'], trim: true },
  gstin: { type: String, trim: true, uppercase: true },
  pan: { type: String, trim: true, uppercase: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: {
    street: String, city: String, state: String, pincode: String,
  },
  businessType: {
    type: String,
    enum: ['proprietorship', 'partnership', 'pvt_ltd', 'ltd', 'llp', 'other'],
    default: 'other',
  },
  industry: { type: String, trim: true },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notes: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
