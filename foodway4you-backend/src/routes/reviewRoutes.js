import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', auth, bumpNamespaces(['reviews']), ctrl.create);
router.get('/', cache({ namespace: 'reviews', ttlSeconds: 60 }), ctrl.list);

export default router;
