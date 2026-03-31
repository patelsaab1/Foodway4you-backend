import express from 'express';
import auth from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/paymentController.js';

const router = express.Router();

router.post('/order', auth, ctrl.createOrder);
router.post('/verify', auth, ctrl.verify);
router.get('/allpayment', auth, ctrl.getAllPayments);

export default router;
