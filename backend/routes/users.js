const express = require('express');
const router = express.Router();
const { protect, authorizeCA } = require('../middleware/auth');
const { getUsers, createUser, updateUser, deleteUser, getClientLogin, createClientLogin, deleteClientLogin, permanentDeleteUser } = require('../controllers/userController');

router.get('/', protect, authorizeCA, getUsers);
router.post('/', protect, authorizeCA, createUser);
router.put('/:id', protect, authorizeCA, updateUser);
router.delete('/:id', protect, authorizeCA, deleteUser);
router.delete('/:id/permanent', protect, authorizeCA, permanentDeleteUser);

router.get('/client-login/:clientId', protect, authorizeCA, getClientLogin);
router.post('/client-login/:clientId', protect, authorizeCA, createClientLogin);
router.delete('/client-login/:clientId', protect, authorizeCA, deleteClientLogin);

module.exports = router;
