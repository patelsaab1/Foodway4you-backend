const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { cache, bumpNamespaces } = require('../middleware/cacheMiddleware');
const ctrl = require('../controllers/menuController');

const router = express.Router();

router.post('/', auth, role(['restaurant', 'admin']), bumpNamespaces(['menu']), ctrl.create);
router.get('/', cache({ namespace: 'menu', ttlSeconds: 120 }), ctrl.list);
router.put('/:id', auth, role(['restaurant', 'admin']), bumpNamespaces(['menu']), ctrl.update);
router.delete('/:id', auth, role(['restaurant', 'admin']), bumpNamespaces(['menu']), ctrl.remove);

module.exports = router;

