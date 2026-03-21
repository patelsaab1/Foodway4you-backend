import express from 'express';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/deliveryController.js';

const router = express.Router();

router.get('/me', auth, role(['rider']), cache({ namespace: 'delivery', ttlSeconds: 15, varyByUser: true }), ctrl.profile);
router.post('/location', auth, role(['rider']), bumpNamespaces(['delivery']), ctrl.updateLocation);

export default router;

