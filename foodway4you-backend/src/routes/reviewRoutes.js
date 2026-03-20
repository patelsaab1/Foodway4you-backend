const express = require('express');
const auth = require('../middleware/authMiddleware');
const { cache, bumpNamespaces } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/reviewController');

const router = express.Router();

router.post('/', auth, bumpNamespaces(['reviews']), ctrl.create);
router.get('/', cache({ namespace: 'reviews', ttlSeconds: 60 }), ctrl.list);

module.exports = router;
