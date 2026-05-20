const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getDocuments, uploadDocument, downloadDocument, deleteDocument, getDocumentStats,
} = require('../controllers/documentController');

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
    next();
  });
};

router.get('/client/:clientId', protect, getDocuments);
router.get('/stats/:clientId', protect, getDocumentStats);
router.post('/upload', protect, handleUpload, uploadDocument);
router.get('/download/:id', protect, downloadDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
