const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const payment = require('../controllers/paymentController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, isAdmin, dashboard.getStats);
router.post('/payment/create-order', authenticate, payment.createPaymentOrder);
router.post('/payment/verify', authenticate, payment.verifyPayment);

module.exports = router;
