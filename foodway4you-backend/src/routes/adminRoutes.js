const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { cache } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', auth, role(['admin']), cache({ namespace: 'admin', ttlSeconds: 15, varyByUser: true }), ctrl.dashboard);

module.exports = router;
