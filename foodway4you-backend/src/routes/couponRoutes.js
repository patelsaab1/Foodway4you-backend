import express from 'express';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import * as ctrl from '../controllers/couponController.js';

const router = express.Router();

router.post('/', auth, role(['admin']), ctrl.create);
router.post('/apply', auth, ctrl.apply);

export default router;
