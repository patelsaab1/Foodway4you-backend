const express = require('express');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const ctrl = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', auth, role(['admin']), ctrl.dashboard);

module.exports = router;

