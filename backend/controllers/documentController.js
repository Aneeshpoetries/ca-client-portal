const mongoose = require('mongoose');
const streamifier = require('streamifier');
const Document = require('../models/Document');
const Client = require('../models/Client');
const { cloudinary } = require('../config/cloudinary');

const uploadToCloudinary = (buffer, options) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
    if (err) return reject(err);
    resolve(result);
  });
  streamifier.createReadStream(buffer).pipe(stream);
});

const getDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { category, year, documentType } = req.query;

    if (req.user.role === 'client') {
      if (req.user.linkedClient?.toString() !== clientId)
        return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role !== 'ca') {
      const hasAccess = req.user.assignedClients.some(c => c.toString() === clientId);
      if (!hasAccess) return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { client: clientId, tenantId: req.tenantId };
    if (category) filter.category = category;
    if (year) filter['period.year'] = parseInt(year);
    if (documentType) filter.documentType = documentType;

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { clientId, category, documentType, description, year, month, quarter, financialYear, tags } = req.body;
    if (!clientId) return res.status(400).json({ message: 'Client ID is required' });

    const client = await Client.findOne({ _id: clientId, tenantId: req.tenantId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.user.role === 'client') {
      if (req.user.linkedClient?.toString() !== clientId)
        return res.status(403).json({ message: 'Access denied' });
      const clientAllowed = ['gst_return', 'itr', 'client_document'];
      if (!clientAllowed.includes(category))
        return res.status(403).json({ message: 'Clients can only upload source documents' });
    } else if (req.user.role !== 'ca') {
      const hasAccess = req.user.assignedClients.some(c => c.toString() === clientId);
      if (!hasAccess) return res.status(403).json({ message: 'Access denied' });
    }

    // Upload buffer to Cloudinary
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder: `ca-portal/${clientId}`,
      resource_type: 'raw',
      public_id: `${Date.now()}-${safeName}`,
    });

    const document = await Document.create({
      tenantId: req.tenantId,
      client: clientId,
      uploadedBy: req.user._id,
      originalName: req.file.originalname,
      fileUrl: cloudResult.secure_url,
      publicId: cloudResult.public_id,
      fileSize: req.file.size || cloudResult.bytes || 0,
      mimeType: req.file.mimetype,
      category,
      documentType,
      description,
      period: {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        quarter,
        financialYear,
      },
      tags: tags ? JSON.parse(tags) : [],
    });

    await document.populate('uploadedBy', 'name role');
    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Returns the Cloudinary URL so the frontend can download directly
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (req.user.role === 'client') {
      if (req.user.linkedClient?.toString() !== document.client.toString())
        return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role !== 'ca') {
      const hasAccess = req.user.assignedClients.some(c => c.toString() === document.client.toString());
      if (!hasAccess) return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ success: true, fileUrl: document.fileUrl, originalName: document.originalName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const isOwner = document.uploadedBy.toString() === req.user._id.toString();
    if (req.user.role !== 'ca' && !isOwner) return res.status(403).json({ message: 'Access denied' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.publicId, { resource_type: 'raw' });
    } catch (e) {
      console.error('Cloudinary delete error (non-fatal):', e.message);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDocumentStats = async (req, res) => {
  try {
    const { clientId } = req.params;

    const yearStats = await Document.aggregate([
      { $match: { client: new mongoose.Types.ObjectId(clientId), tenantId: req.tenantId } },
      { $group: { _id: '$period.year', count: { $sum: 1 }, categories: { $addToSet: '$category' } } },
      { $sort: { _id: -1 } },
    ]);

    const categoryStats = await Document.aggregate([
      { $match: { client: new mongoose.Types.ObjectId(clientId), tenantId: req.tenantId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, yearStats, categoryStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDocuments, uploadDocument, downloadDocument, deleteDocument, getDocumentStats };
