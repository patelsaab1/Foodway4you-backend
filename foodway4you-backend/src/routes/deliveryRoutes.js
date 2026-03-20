const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/deliveryController');

const router = express.Router();

router.get('/me', auth, role(['rider']), ctrl.profile);
router.post('/location', auth, role(['rider']), ctrl.updateLocation);

module.exports = router;

