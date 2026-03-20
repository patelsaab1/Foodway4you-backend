const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/orderController');

const router = express.Router();

router.post('/', auth, ctrl.place);
router.get('/:id/track', auth, ctrl.track);
router.patch('/:id/status', auth, ctrl.updateStatus);
router.post('/:id/cancel', auth, ctrl.cancel);

module.exports = router;

