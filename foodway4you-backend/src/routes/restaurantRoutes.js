const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { cache, bumpNamespaces } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/restaurantController');

const router = express.Router();

router.post('/', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.create);
router.get('/', cache({ namespace: 'restaurants', ttlSeconds: 120 }), ctrl.list);
router.get('/:id', cache({ namespace: 'restaurants', ttlSeconds: 300 }), ctrl.get);
router.put('/:id', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.update);
router.delete('/:id', auth, role(['admin']), bumpNamespaces(['restaurants']), ctrl.remove);

module.exports = router;
