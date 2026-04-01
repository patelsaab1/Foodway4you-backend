import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/orderController.js';


const router = express.Router();

// 1. RESTAURANT ROUTES (Specific routes hamesha upar hone chahiye)
// Isse restaurant apne orders dekh payega
router.get('/restaurant/:restaurantId', auth, ctrl.getRestaurantOrders);

// 2. ORDER ACTIONS (Accept/Status/Cancel)
// Jab restaurant order accept kare
router.patch('/:id/accept', auth, bumpNamespaces(['orders']), ctrl.confirmOrder);

// Status manually update karne ke liye
router.patch('/:id/status', auth, bumpNamespaces(['orders']), ctrl.updateStatus);

// Order cancel karne ke liye
router.post('/:id/cancel', auth, bumpNamespaces(['orders']), ctrl.cancel);

// 3. CUSTOMER ROUTES
// Order place karne ke liye
router.post('/', auth, bumpNamespaces(['orders']), ctrl.place);

// Order track karne ke liye (Cachable)
router.get('/:id/track', auth, cache({ namespace: 'orders', ttlSeconds: 20, varyByUser: true }), ctrl.track);

export default router;