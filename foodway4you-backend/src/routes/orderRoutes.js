import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/orderController.js';

const router = express.Router();

router.post('/', auth, bumpNamespaces(['orders']), ctrl.place);
router.get('/:id/track', auth, cache({ namespace: 'orders', ttlSeconds: 20, varyByUser: true }), ctrl.track);
router.patch('/:id/status', auth, bumpNamespaces(['orders']), ctrl.updateStatus);
router.post('/:id/cancel', auth, bumpNamespaces(['orders']), ctrl.cancel);

export default router;
