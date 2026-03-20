const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  ctrl.register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;

