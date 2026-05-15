const express = require('express');
const router = express.Router();
const category = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', category.getAll);
router.get('/:slug', category.getBySlug);
router.post('/', authenticate, isAdmin, upload.single('image'), category.create);
router.put('/:id', authenticate, isAdmin, upload.single('image'), category.update);
router.delete('/:id', authenticate, isAdmin, category.remove);

module.exports = router;
