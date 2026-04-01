// import express from 'express';
// import auth from '../middleware/authMiddleware.js';
// import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
// import * as ctrl from '../controllers/reviewController.js';

// const router = express.Router();

// router.post('/', auth, bumpNamespaces(['reviews']), ctrl.create);
// router.get('/', cache({ namespace: 'reviews', ttlSeconds: 60 }), ctrl.list);

// export default router;


import express from 'express';
import { create, list, averageRating } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';

const router = express.Router();

// ================= CREATE REVIEW =================
// Only customers can create a review
router.post('/create',authMiddleware,role(['customer']),create);

// ================= LIST REVIEWS =================
// Anyone (customer, restaurant, admin) can view reviews
router.get('/list',  authMiddleware,  role(['customer', 'restaurant', 'admin']),  list);

// ================= GET AVERAGE RATING =================
// Anyone can see average rating of a restaurant
router.get('/average',  authMiddleware,  role(['customer', 'restaurant', 'admin']),  averageRating);

export default router;