const express = require('express');
const router = express.Router();
const order = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);

router.post('/', order.create);
router.get('/my', order.getUserOrders);
router.get('/all', isAdmin, order.getAll);
router.get('/:id', order.getById);
router.put('/:id/status', isAdmin, order.updateStatus);

module.exports = router;
