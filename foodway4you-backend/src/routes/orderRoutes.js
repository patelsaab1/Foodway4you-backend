const express = require('express');
const auth = require('../middleware/authMiddleware');
const { cache, bumpNamespaces } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/orderController');

const router = express.Router();

router.post('/', auth, bumpNamespaces(['orders']), ctrl.place);
router.get('/:id/track', auth, cache({ namespace: 'orders', ttlSeconds: 20, varyByUser: true }), ctrl.track);
router.patch('/:id/status', auth, bumpNamespaces(['orders']), ctrl.updateStatus);
router.post('/:id/cancel', auth, bumpNamespaces(['orders']), ctrl.cancel);

module.exports = router;
