import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import * as authVal from '../middleware/authValidationMiddleware.js';

import { cache } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/authController.js';

const router = express.Router();

// router.post('/register', ctrl.register);
router.post('/register', authVal.registerValidation, validate, ctrl.register);
router.post('/login', authVal.loginValidation, validate, ctrl.login);
router.post('/firebase-login', ctrl.firebaseAuth);
router.post('/refresh', ctrl.refresh);
router.post('/forgot-password', [body('email').isEmail()], validate, ctrl.forgotPassword);
router.post('/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 6 })], validate, ctrl.resetPassword);
router.get('/me', auth, cache({ namespace: 'auth', ttlSeconds: 10, varyByUser: true }), (req, res) => res.json({ user: req.user }));
router.patch(
  '/me',
  auth,
  authVal.updateProfileValidation, 
  validate,
  ctrl.updateProfile
);


export default router;