// import response from "../utils/responseHelper.js";
// import {
//   createNotificationService,
//   getAllNotificationsService,
//   markNotificationReadService,
//   getMyNotificationsService,
//   unreadCountService,
//   markAllReadService,
//   deleteNotificationService,
//   sendNotificationByRoleService
// } from "../services/notificationService.js";

// export const createNotification = async (req, res, next) => {
//   try {
//     const notification = await createNotificationService(req.body);
//     response.success(res, notification, "Notification sent successfully");
//   } catch (err) {
//     next(err);
//   }
// };

// export const listAll = async (req, res, next) => {
//   try {
//     const docs = await getAllNotificationsService();
//     response.success(res, docs);
//   } catch (err) {
//     next(err);
//   }
// };

// export const markRead = async (req, res, next) => {
//   try {
//     const doc = await markNotificationReadService(req.params.id);
//     response.success(res, doc, "Marked as read");
//   } catch (err) {
//     next(err);
//   }
// };

// export const getMyNotifications = async (req, res, next) => {
//   try {
//     const docs = await getMyNotificationsService(req.user.id);
//     response.success(res, docs);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getUnreadCount = async (req, res, next) => {
//   try {
//     const count = await unreadCountService(req.user.id);
//     response.success(res, count);
//   } catch (err) {
//     next(err);
//   }
// };

// export const markAllRead = async (req, res, next) => {
//   try {
//     const result = await markAllReadService(req.user.id);
//     response.success(res, result, "All notifications marked as read");
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteNotification = async (req, res, next) => {
//   try {
//     const doc = await deleteNotificationService(req.params.id);
//     response.success(res, doc, "Notification deleted");
//   } catch (err) {
//     next(err);
//   }
// };

// export const sendNotificationByRole = async (req, res, next) => {
//   try {
//     const { role, ...data } = req.body;

//     const result = await sendNotificationByRoleService(role, data);

//     response.success(res, result, "Notification sent to all users of this role");
//   } catch (err) {
//     next(err);
//   }
// };


import response from "../utils/responseHelper.js";
import {
  createNotificationService,
  getAllNotificationsService,
  markNotificationReadService,
  getMyNotificationsService,
  unreadCountService,
  markAllReadService,
  deleteNotificationService,
  sendNotificationByRoleService,
  sendNotificationService
} from "../services/notificationService.js";

// Create notification
export const createNotification = async (req, res, next) => {
  try {

    const notification = await createNotificationService(req.body);

    return response.success(
      res,
      notification,
      "Notification created successfully"
    );

  } catch (err) {
    next(err);
  }
};

// Send notification helper
export const sendNotification = async (req, res, next) => {
  try {

    const notification = await sendNotificationService(req.body);

    return response.success(
      res,
      notification,
      "Notification sent successfully"
    );

  } catch (err) {
    next(err);
  }
};

// Admin - Get all notifications
export const listAll = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const docs = await getAllNotificationsService(page, limit);

    return response.success(res, docs);

  } catch (err) {
    next(err);
  }
};

// User - Get my notifications
export const getMyNotifications = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const docs = await getMyNotificationsService(
      req.user.id,
      page,
      limit
    );

    return response.success(res, docs);

  } catch (err) {
    next(err);
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res, next) => {
  try {

    const count = await unreadCountService(req.user.id);

    return response.success(res, count);

  } catch (err) {
    next(err);
  }
};

// Mark notification as read
export const markRead = async (req, res, next) => {
  try {

    const doc = await markNotificationReadService(
      req.params.id,
      req.user.id
    );

    return response.success(
      res,
      doc,
      "Notification marked as read"
    );

  } catch (err) {
    next(err);
  }
};

// Mark all notifications read
export const markAllRead = async (req, res, next) => {
  try {

    const result = await markAllReadService(req.user.id);

    return response.success(
      res,
      result,
      "All notifications marked as read"
    );

  } catch (err) {
    next(err);
  }
};

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {

    const doc = await deleteNotificationService(
      req.params.id,
      req.user.id
    );

    return response.success(
      res,
      doc,
      "Notification deleted successfully"
    );

  } catch (err) {
    next(err);
  }
};

// Send notification to role
export const sendNotificationByRole = async (req, res, next) => {
  try {

    const { role, ...data } = req.body;

    const result = await sendNotificationByRoleService(
      role,
      data
    );

    return response.success(
      res,
      result,
      "Notification sent to all users of this role"
    );

  } catch (err) {
    next(err);
  }
};