const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/restaurantController');

const router = express.Router();

router.post('/', auth, role(['restaurant', 'admin']), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.put('/:id', auth, role(['restaurant', 'admin']), ctrl.update);
router.delete('/:id', auth, role(['admin']), ctrl.remove);

module.exports = router;

