const Announcement = require('../models/Announcement');

const create = async (req, res) => {
  try {
    const { title, content, category, isImportant } = req.body;
    if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: 'Title and content are required' });
    const ann = await Announcement.create({ tenantId: req.tenantId, title, content, category, isImportant, publishedBy: req.user._id });
    await ann.populate('publishedBy', 'name role');
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAll = async (req, res) => {
  try {
    const announcements = await Announcement.find({ tenantId: req.tenantId })
      .sort({ isImportant: -1, createdAt: -1 })
      .populate('publishedBy', 'name role');
    res.json({ success: true, announcements });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    const { title, content, category, isImportant } = req.body;
    const ann = await Announcement.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { title, content, category, isImportant },
      { new: true, runValidators: true }
    ).populate('publishedBy', 'name role');
    if (!ann) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ success: true, announcement: ann });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Announcement.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { create, getAll, update, remove };
