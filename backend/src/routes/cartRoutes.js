const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cart.getCart);
router.post('/items', cart.addItem);
router.put('/items/:itemId', cart.updateItem);
router.delete('/items/:itemId', cart.removeItem);
router.delete('/', cart.clearCart);

module.exports = router;
