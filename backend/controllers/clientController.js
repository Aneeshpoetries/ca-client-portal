const Client = require('../models/Client');
const User = require('../models/User');
const Document = require('../models/Document');

const getClients = async (req, res) => {
  try {
    let clients;
    if (req.user.role === 'ca') {
      clients = await Client.find({ tenantId: req.tenantId, isActive: true })
        .populate('assignedStaff', 'name email')
        .sort({ createdAt: -1 });
    } else {
      clients = await Client.find({
        tenantId: req.tenantId,
        _id: { $in: req.user.assignedClients },
        isActive: true,
      }).sort({ name: 1 });
    }

    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const docCount = await Document.countDocuments({ client: client._id, tenantId: req.tenantId });
        const lastDoc = await Document.findOne({ client: client._id, tenantId: req.tenantId }).sort({ createdAt: -1 });
        return { ...client.toObject(), documentCount: docCount, lastActivity: lastDoc?.createdAt || null };
      })
    );

    res.json({ success: true, clients: clientsWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, gstin, pan, email, phone, address, businessType, industry, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Client name is required' });
    const client = await Client.create({
      tenantId: req.tenantId, name, gstin, pan, email, phone, address, businessType, industry, notes,
    });
    res.status(201).json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, tenantId: req.tenantId })
      .populate('assignedStaff', 'name email role');
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.user.role !== 'ca') {
      const hasAccess = req.user.assignedClients.some(c => c.toString() === req.params.id);
      if (!hasAccess) return res.status(403).json({ message: 'Access denied' });
    }

    const docStats = await Document.aggregate([
      { $match: { client: client._id, tenantId: req.tenantId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, client, docStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ success: true, client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ success: true, message: 'Client deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignStaff = async (req, res) => {
  try {
    const { staffId, action } = req.body;
    const client = await Client.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const staff = await User.findOne({ _id: staffId, tenantId: req.tenantId, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (action === 'assign') {
      if (!client.assignedStaff.includes(staffId)) { client.assignedStaff.push(staffId); await client.save(); }
      if (!staff.assignedClients.includes(client._id)) { staff.assignedClients.push(client._id); await staff.save(); }
    } else if (action === 'remove') {
      client.assignedStaff = client.assignedStaff.filter(s => s.toString() !== staffId);
      await client.save();
      staff.assignedClients = staff.assignedClients.filter(c => c.toString() !== req.params.id);
      await staff.save();
    }

    res.json({ success: true, message: `Staff ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getClients, createClient, getClientById, updateClient, deleteClient, assignStaff };
