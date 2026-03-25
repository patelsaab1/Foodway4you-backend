import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotificationService = async (data) => {
  const notification = await Notification.create(data);
  return notification;
};

export const getAllNotificationsService = async () => {
  const docs = await Notification.find().sort({ createdAt: -1 });
  return docs;
};

export const markNotificationReadService = async (id) => {
  const doc = await Notification.findByIdAndUpdate(
    id,
    {
      isRead: true,
      readAt: new Date()
    },
    { new: true }
  );
  return doc;
};

export const getMyNotificationsService = async (userId) => {
  const notifications = await Notification
    .find({ recipient: userId })
    .sort({ createdAt: -1 });

  return notifications;
};

export const unreadCountService = async (userId) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  return count;
};

export const markAllReadService = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  return result;
};

export const deleteNotificationService = async (id) => {
  const doc = await Notification.findByIdAndDelete(id);
  return doc;
};

export const sendNotificationByRoleService = async (role, data) => {
  const users = await User.find({ role });

  const notifications = users.map(user => ({
    ...data,
    recipient: user._id
  }));

  const result = await Notification.insertMany(notifications);
  return result;
};