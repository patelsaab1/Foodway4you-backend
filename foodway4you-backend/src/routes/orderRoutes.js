import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/orderController.js'; // Aapne 'ctrl' use kiya hai

const router = express.Router();

// ====================== CUSTOMER ROUTES ======================

// Order place karna
router.post('/', auth, bumpNamespaces(['orders']), ctrl.place);

// Order track karna (User specific cache)
router.get('/:id/track', auth, cache({ namespace: 'orders', ttlSeconds: 20, varyByUser: true }), ctrl.track);

// Order cancel karna
router.post('/:id/cancel', auth, bumpNamespaces(['orders']), ctrl.cancel);


// ====================== RESTAURANT ROUTES ======================


// Note: 'orderController' ki jagah 'ctrl' use karein
router.get('/restaurant/:restaurantId', auth, ctrl.getRestaurantOrders);

// Order accept karna (Status 'preparing' karne ke liye)
router.patch('/:id/accept', auth, bumpNamespaces(['orders']), ctrl.acceptOrder);


router.patch('/:id/status', auth, bumpNamespaces(['orders']), ctrl.updateStatus);

export default router;