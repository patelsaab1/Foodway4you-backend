import express from 'express';
import multer from 'multer';
import auth from '../middleware/authMiddleware.js';
import role from '../middleware/roleMiddleware.js';
import { cache, bumpNamespaces } from '../middleware/cacheMiddleware.js';
import * as ctrl from '../controllers/menuController.js';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post(
  '/',
  auth,
  role(['restaurant', 'admin']),
  upload.single('image'),
  bumpNamespaces(['menu']),
  ctrl.create
);

router.get('/', cache({ namespace: 'menu', ttlSeconds: 120 }), ctrl.list);

router.put(
  '/:id',
  auth,
  role(['restaurant', 'admin']),
  upload.single('image'),
  bumpNamespaces(['menu']),
  ctrl.update
);

router.delete('/:id', auth, role(['restaurant', 'admin']), bumpNamespaces(['menu']), ctrl.remove);

export default router;
