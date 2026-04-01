import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import role from "../middleware/roleMiddleware.js";

import {
  createNotification,
  sendNotification,
  listAll,
  getMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  sendNotificationByRole
} from "../controllers/notificationController.js";

const router = express.Router();

// Create notification
router.post("/create", authMiddleware, createNotification);

// Send notification helper
router.post("/send", authMiddleware, sendNotification);

// Admin - get all notifications
router.get("/", authMiddleware, role(["admin"]), listAll);

// Get logged-in user notifications
router.get("/showallN", authMiddleware, getMyNotifications);

// Get unread notifications count
router.get("/unread-count", authMiddleware, getUnreadCount);

// Mark notification as read
router.patch("/:id/read", authMiddleware, markRead);

// Mark all notifications as read
router.patch("/read-all", authMiddleware, markAllRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

// Send notification by role (Admin only)
router.post("/send-role", authMiddleware, role(["admin"]), sendNotificationByRole);


export default router;