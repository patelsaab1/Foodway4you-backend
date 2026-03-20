const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/couponController');

const router = express.Router();

router.post('/', auth, role(['admin']), ctrl.create);
router.post('/apply', auth, ctrl.apply);

module.exports = router;

