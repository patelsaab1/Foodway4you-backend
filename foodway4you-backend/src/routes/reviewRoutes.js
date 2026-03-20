const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/reviewController');

const router = express.Router();

router.post('/', auth, ctrl.create);
router.get('/', ctrl.list);

module.exports = router;

