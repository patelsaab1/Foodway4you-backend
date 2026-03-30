import express from "express";
import auth from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";

import * as ctrl from "../controllers/adminRestaurantController.js";

const router = express.Router();

// ✅ Get all restaurants
router.get(
  "/restaurants",
  auth,
  role(["admin"]),
  cache({ namespace: "admin:restaurants", ttlSeconds: 20 }),
  ctrl.getAllRestaurants
);

// ✅ Approve / Reject
router.put(
  "/restaurants/:id/status",
  auth,
  role(["admin"]),
  ctrl.updateRestaurantStatus
);

// ✅ Block / Unblock
router.put(
  "/restaurants/:id/toggle-block",
  auth,
  role(["admin"]),
  ctrl.toggleBlockRestaurant
);

export default router;