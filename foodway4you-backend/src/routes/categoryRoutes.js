import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, roleMiddleware(["admin","restaurant"]), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", authMiddleware, roleMiddleware(["admin","restaurant"]), updateCategory);
router.delete("/:id", authMiddleware, roleMiddleware(["admin","restaurant"]), deleteCategory);

export default router;