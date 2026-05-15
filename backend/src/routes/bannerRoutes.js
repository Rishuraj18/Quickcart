const express = require('express');
const router = express.Router();
const banner = require('../controllers/bannerController');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', banner.getActive);
router.get('/all', authenticate, isAdmin, banner.getAll);
router.post('/', authenticate, isAdmin, upload.single('image'), banner.create);
router.put('/:id', authenticate, isAdmin, upload.single('image'), banner.update);
router.delete('/:id', authenticate, isAdmin, banner.remove);

module.exports = router;
