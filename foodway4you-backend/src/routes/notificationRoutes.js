import express from 'express';
import { createNotification, listAll, markRead, getMyNotifications, getUnreadCount, markAllRead, deleteNotification, sendNotificationByRole } from '../controllers/notificationController.js';
import roleMiddleware from "../middleware/roleMiddleware.js";
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createNotification);
router.get("/all-notifications", authMiddleware, roleMiddleware(["admin"]), listAll);
router.patch('/:id/read', authMiddleware, markRead);

router.get("/my-notifications", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/mark-all-read", authMiddleware, markAllRead);
router.delete("/:id", authMiddleware, deleteNotification);
router.post("/role", authMiddleware, roleMiddleware(["admin"]), sendNotificationByRole);

export default router;