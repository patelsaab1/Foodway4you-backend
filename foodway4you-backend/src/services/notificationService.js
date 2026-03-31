// import Notification from "../models/Notification.js";
// import User from "../models/User.js";

// export const createNotificationService = async (data) => {
//   const notification = await Notification.create(data);
//   return notification;
// };

// export const getAllNotificationsService = async () => {
//   const docs = await Notification.find().sort({ createdAt: -1 });
//   return docs;
// };

// export const markNotificationReadService = async (id) => {
//   const doc = await Notification.findByIdAndUpdate(
//     id,
//     {
//       isRead: true,
//       readAt: new Date()
//     },
//     { new: true }
//   );
//   return doc;
// };

// export const getMyNotificationsService = async (userId) => {
//   const notifications = await Notification
//     .find({ recipient: userId })
//     .sort({ createdAt: -1 });

//   return notifications;
// };

// export const unreadCountService = async (userId) => {
//   const count = await Notification.countDocuments({
//     recipient: userId,
//     isRead: false
//   });

//   return count;
// };

// export const markAllReadService = async (userId) => {
//   const result = await Notification.updateMany(
//     { recipient: userId, isRead: false },
//     {
//       isRead: true,
//       readAt: new Date()
//     }
//   );

//   return result;
// };

// export const deleteNotificationService = async (id) => {
//   const doc = await Notification.findByIdAndDelete(id);
//   return doc;
// };

// export const sendNotificationByRoleService = async (role, data) => {
//   const users = await User.find({ role });

//   const notifications = users.map(user => ({
//     ...data,
//     recipient: user._id
//   }));

//   const result = await Notification.insertMany(notifications);
//   return result;
// };


import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Create single notification
export const createNotificationService = async (data) => {
  const notification = await Notification.create({
    ...data,
    sentAt: new Date()
  });

  return notification;
};


// Send notification helper (used by order, payment, delivery modules)
export const sendNotificationService = async ({
  recipient,
  sender = null,
  title,
  message,
  type,
  data = {}
}) => {

  const notification = await Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    data,
    sentAt: new Date()
  });

  return notification;
};


// Get all notifications (Admin use)
export const getAllNotificationsService = async (page = 1, limit = 20) => {

  const skip = (page - 1) * limit;

  const docs = await Notification.find()
    .populate("recipient", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return docs;
};


// Get notifications for logged-in user
export const getMyNotificationsService = async (userId, page = 1, limit = 10) => {

  const skip = (page - 1) * limit;

  const notifications = await Notification.find({
    recipient: userId
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return notifications;
};


// Get unread notifications count
export const unreadCountService = async (userId) => {

  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  return count;
};


// Mark single notification as read
export const markNotificationReadService = async (notificationId, userId) => {

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId
    },
    {
      isRead: true,
      readAt: new Date()
    },
    { new: true }
  );

  return notification;
};

// Mark all notifications as read
export const markAllReadService = async (userId) => {

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  return result;
};


// Delete notification
export const deleteNotificationService = async (notificationId, userId) => {

  const doc = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId
  });

  return doc;
};


// Send notification to all users of specific role
export const sendNotificationByRoleService = async (role, data) => {

  const users = await User.find({ role }).select("_id");

  const notifications = users.map(user => ({
    ...data,
    recipient: user._id,
    sentAt: new Date()
  }));

  const result = await Notification.insertMany(notifications);

  return result;
};


// Send notification to multiple users
export const sendBulkNotificationService = async (userIds, data) => {

  const notifications = userIds.map(id => ({
    ...data,
    recipient: id,
    sentAt: new Date()
  }));

  return await Notification.insertMany(notifications);
};


//  Delete old notifications (cleanup job)
export const deleteOldNotificationsService = async () => {

  const date = new Date();
  date.setDate(date.getDate() - 30);

  return await Notification.deleteMany({
    createdAt: { $lt: date }
  });
};