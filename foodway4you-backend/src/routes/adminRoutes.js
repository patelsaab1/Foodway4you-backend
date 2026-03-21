import express from 'express';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import { cache } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', auth, role(['admin']), cache({ namespace: 'admin', ttlSeconds: 15, varyByUser: true }), ctrl.dashboard);

export default router;
