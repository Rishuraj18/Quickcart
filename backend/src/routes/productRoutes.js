const express = require('express');
const router = express.Router();
const product = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

// Public
router.get('/', product.getAll);
router.get('/:slug', product.getBySlug);

// Admin
router.post('/', authenticate, isAdmin, upload.array('images', 5), product.create);
router.put('/:id', authenticate, isAdmin, upload.array('images', 5), product.update);
router.delete('/:id', authenticate, isAdmin, product.remove);
router.delete('/image/:imageId', authenticate, isAdmin, product.deleteImage);

module.exports = router;
