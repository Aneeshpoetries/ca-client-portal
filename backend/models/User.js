const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  googleId: { type: String, select: false },
  password: { type: String, minlength: 6, select: false },
  role: { type: String, enum: ['ca', 'staff', 'client'], default: 'staff' },
  // For staff/client: points to their CA's _id. For CA: not set (use their own _id as tenantId).
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  linkedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
