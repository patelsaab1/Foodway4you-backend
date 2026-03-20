const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

router.post('/order', auth, ctrl.createOrder);
router.post('/verify', auth, ctrl.verify);

module.exports = router;

