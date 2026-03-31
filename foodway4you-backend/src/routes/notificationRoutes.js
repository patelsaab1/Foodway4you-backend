// import express from 'express';
// import { createNotification, listAll, markRead, getMyNotifications, getUnreadCount, markAllRead, deleteNotification, sendNotificationByRole } from '../controllers/notificationController.js';
// import roleMiddleware from "../middleware/roleMiddleware.js";
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// router.post('/create', authMiddleware, createNotification);
// router.get("/all-notifications", authMiddleware, roleMiddleware(["admin"]), listAll);
// router.patch('/:id/read', authMiddleware, markRead);

// router.get("/my-notifications", authMiddleware, getMyNotifications);
// router.get("/unread-count", authMiddleware, getUnreadCount);
// router.patch("/:id/mark-all-read", authMiddleware, markAllRead);
// router.delete("/:id", authMiddleware, deleteNotification);
// router.post("/role", authMiddleware, roleMiddleware(["admin"]), sendNotificationByRole);

// export default router;

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