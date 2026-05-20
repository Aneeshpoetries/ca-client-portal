const express = require('express');
const router = express.Router();
const { protect, authorizeCA } = require('../middleware/auth');
const {
  getClients, createClient, getClientById, updateClient, deleteClient, assignStaff,
} = require('../controllers/clientController');

router.get('/', protect, getClients);
router.post('/', protect, authorizeCA, createClient);
router.get('/:id', protect, getClientById);
router.put('/:id', protect, authorizeCA, updateClient);
router.delete('/:id', protect, authorizeCA, deleteClient);
router.post('/:id/staff', protect, authorizeCA, assignStaff);

module.exports = router;
