const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const setTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const getSetupStatus = async (req, res) => {
  // Always returns false in multi-tenant mode — setup is always available
  res.json({ isSetupComplete: false });
};

// Any new user registering via this endpoint becomes a CA (tenant)
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'ca' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, assignedClients: [] },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password').populate('linkedClient', '_id name');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact your CA.' });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, assignedClients: user.assignedClients, tenantId: user.tenantId, linkedClient: user.linkedClient },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'lax' });
  res.json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedClients', 'name gstin')
      .populate('linkedClient', '_id name');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been generated.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0];
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;

    console.log('\n=== PASSWORD RESET LINK (dev mode) ===');
    console.log(resetUrl);
    console.log('======================================\n');

    res.json({
      success: true,
      message: 'Reset link generated.',
      ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth — new Google users become CA (their own tenant); existing users log in
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential missing' });

    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const { sub: googleId, email, name } = ticket.getPayload();

    let user = await User.findOne({ googleId }).select('+googleId') ||
               await User.findOne({ email }).select('+googleId');

    if (!user) {
      // New Google sign-in → create as CA
      user = await User.create({ name, email, googleId, role: 'ca' });
    } else {
      if (!user.googleId) { user.googleId = googleId; await user.save({ validateBeforeSave: false }); }
      if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact your CA.' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, assignedClients: user.assignedClients, tenantId: user.tenantId },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(401).json({ message: 'Google sign-in failed. Please try again.' });
  }
};

module.exports = { getSetupStatus, register, login, googleAuth, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
