import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/deliveryController.js';
import {getAll} from '../controllers/deliveryController.js';

const router = express.Router();

router.post("/create", authMiddleware, role(["rider"]), ctrl.createDeliveryPartner);
router.get('/me', authMiddleware, role(['rider']), cache({ namespace: 'delivery', ttlSeconds: 15, varyByUser: true }), ctrl.profile);
router.post('/location', authMiddleware, role(['rider']), bumpNamespaces(['delivery']), ctrl.updateLocation);
router.get("/getAll",authMiddleware, role(["admin"]), getAll);

export default router;

