import response from "../utils/responseHelper.js";
import {
  createNotificationService,
  getAllNotificationsService,
  markNotificationReadService,
  getMyNotificationsService,
  unreadCountService,
  markAllReadService,
  deleteNotificationService,
  sendNotificationByRoleService
} from "../services/notificationService.js";

export const createNotification = async (req, res, next) => {
  try {
    const notification = await createNotificationService(req.body);
    response.success(res, notification, "Notification sent successfully");
  } catch (err) {
    next(err);
  }
};

export const listAll = async (req, res, next) => {
  try {
    const docs = await getAllNotificationsService();
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const doc = await markNotificationReadService(req.params.id);
    response.success(res, doc, "Marked as read");
  } catch (err) {
    next(err);
  }
};

export const getMyNotifications = async (req, res, next) => {
  try {
    const docs = await getMyNotificationsService(req.user.id);
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await unreadCountService(req.user.id);
    response.success(res, count);
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllReadService(req.user.id);
    response.success(res, result, "All notifications marked as read");
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const doc = await deleteNotificationService(req.params.id);
    response.success(res, doc, "Notification deleted");
  } catch (err) {
    next(err);
  }
};

export const sendNotificationByRole = async (req, res, next) => {
  try {
    const { role, ...data } = req.body;

    const result = await sendNotificationByRoleService(role, data);

    response.success(res, result, "Notification sent to all users of this role");
  } catch (err) {
    next(err);
  }
};