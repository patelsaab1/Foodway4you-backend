const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { cache, bumpNamespaces } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/deliveryController');

const router = express.Router();

router.get('/me', auth, role(['rider']), cache({ namespace: 'delivery', ttlSeconds: 15, varyByUser: true }), ctrl.profile);
router.post('/location', auth, role(['rider']), bumpNamespaces(['delivery']), ctrl.updateLocation);

module.exports = router;

