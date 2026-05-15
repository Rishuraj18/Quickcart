const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

// User address routes
router.get('/addresses', authenticate, user.getAddresses);
router.post('/addresses', authenticate, user.addAddress);
router.delete('/addresses/:id', authenticate, user.deleteAddress);

// Admin user management
router.get('/', authenticate, isAdmin, user.getAll);
router.put('/:id/role', authenticate, isAdmin, user.updateRole);
router.put('/:id/status', authenticate, isAdmin, user.updateStatus);
router.delete('/:id', authenticate, isAdmin, user.remove);

module.exports = router;
