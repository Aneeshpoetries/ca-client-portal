const User = require('../models/User');
const Client = require('../models/Client');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.tenantId, role: 'staff' })
      .populate('assignedClients', 'name gstin')
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'staff', tenantId: req.tenantId });
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, isActive: user.isActive, assignedClients: user.assignedClients },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, phone, isActive } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { name, phone, isActive },
      { new: true, runValidators: true }
    ).populate('assignedClients', 'name');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Client.updateMany(
      { tenantId: req.tenantId, assignedStaff: req.params.id },
      { $pull: { assignedStaff: req.params.id } }
    );
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientLogin = async (req, res) => {
  try {
    const user = await User.findOne({ linkedClient: req.params.clientId, tenantId: req.tenantId, role: 'client' }).select('-password');
    res.json({ success: true, user: user || null });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createClientLogin = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const { clientId } = req.params;

    const client = await Client.findOne({ _id: clientId, tenantId: req.tenantId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const existing = await User.findOne({ linkedClient: clientId, role: 'client' });
    if (existing) return res.status(400).json({ message: 'Client login already exists' });

    const emailTaken = await User.findOne({ email });
    if (emailTaken) return res.status(400).json({ message: 'Email already in use' });

    const user = await User.create({
      name: name || client.name, email, password,
      role: 'client', linkedClient: clientId, tenantId: req.tenantId,
    });
    res.status(201).json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteClientLogin = async (req, res) => {
  try {
    await User.findOneAndDelete({ linkedClient: req.params.clientId, tenantId: req.tenantId, role: 'client' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const permanentDeleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.tenantId, role: 'staff' });
    if (!user) return res.status(404).json({ message: 'Staff member not found' });

    await Client.updateMany(
      { tenantId: req.tenantId, assignedStaff: user._id },
      { $pull: { assignedStaff: user._id } }
    );

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'Staff member permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getClientLogin, createClientLogin, deleteClientLogin, permanentDeleteUser };
