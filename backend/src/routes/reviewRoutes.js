const express = require('express');
const router = express.Router();
const review = require('../controllers/reviewController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/product/:productId', review.getByProduct);
router.post('/', authenticate, review.create);
router.get('/all', authenticate, isAdmin, review.getAll);
router.delete('/:id', authenticate, isAdmin, review.remove);

module.exports = router;
