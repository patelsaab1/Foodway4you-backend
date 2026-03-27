import express from 'express';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/me', auth, role(['restaurant', 'admin']), cache({ namespace: 'restaurants', ttlSeconds: 30, varyByUser: true }), ctrl.me);
router.post('/onboard', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.onboard);
router.post('/kyc', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.submitKyc);
router.get('/kyc', auth, role(['restaurant', 'admin']), cache({ namespace: 'restaurants', ttlSeconds: 30, varyByUser: true }), ctrl.kycStatus);

router.post('/', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.create);
router.get('/', auth, role(["admin"]), cache({ namespace: 'restaurants', ttlSeconds: 120 }), ctrl.list);
router.get('/:id', cache({ namespace: 'restaurants', ttlSeconds: 300 }), ctrl.get);
router.put('/:id', auth, role(['restaurant', 'admin']), bumpNamespaces(['restaurants']), ctrl.update);
router.delete('/:id', auth, role(['admin']), bumpNamespaces(['restaurants']), ctrl.remove);

export default router;
