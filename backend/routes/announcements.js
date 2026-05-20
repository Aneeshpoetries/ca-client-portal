const express = require('express');
const router = express.Router();
const { protect, authorizeCA } = require('../middleware/auth');
const { create, getAll, update, remove } = require('../controllers/announcementController');

router.get('/', protect, getAll);
router.post('/', protect, authorizeCA, create);
router.put('/:id', protect, authorizeCA, update);
router.delete('/:id', protect, authorizeCA, remove);

module.exports = router;
