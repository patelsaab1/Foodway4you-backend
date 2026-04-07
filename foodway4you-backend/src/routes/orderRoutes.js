import express from 'express';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js'; 
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/orderController.js';

const router = express.Router();
router.get('/', auth, ctrl.list);
router.get('/restaurant/:restaurantId', auth, ctrl.list);
router.get('/:id/rider-accept', ctrl.riderAcceptOrder);
router.patch(
  '/:id/accept', 
  auth, 
  role(['restaurant', 'admin']), 
  bumpNamespaces(['orders']), 
  ctrl.confirmOrder
);

router.patch(
  '/:id/preparing', 
  auth, 
  role(['restaurant', 'admin']), 
  ctrl.startPreparing
);

router.patch(
  '/:id/ready', 
  auth, 
  role(['restaurant', 'admin']), 
  ctrl.orderReady
);

router.patch(
  '/:id/start-delivery', 
  auth, 
  role(['restaurant', 'admin']), 
  ctrl.startDelivery
);

router.patch(
  '/:id/complete', 
  auth, 
  role(['restaurant', 'admin']), 
  bumpNamespaces(['orders']), 
  ctrl.completeOrder
);

router.patch(
  '/:id/status', 
  auth, 
  role(['restaurant', 'admin']), 
  bumpNamespaces(['orders']), 
  ctrl.updateStatus
);

router.post(
  '/:id/cancel', 
  auth, 
  role(['restaurant', 'admin']), 
  bumpNamespaces(['orders']), 
  ctrl.cancel
);

router.post('/', auth, bumpNamespaces(['orders']), ctrl.place);
router.get(
  '/:id/track', 
  auth, 
  cache({ namespace: 'orders', ttlSeconds: 20, varyByUser: true }), 
  ctrl.track
);

export default router;