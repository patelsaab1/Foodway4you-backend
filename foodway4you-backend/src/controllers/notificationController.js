import Notification from '../models/Notification.js';
import response from '../utils/responseHelper.js';

export const list = async (req, res, next) => {
  try {
    const docs = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const doc = await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() }, { new: true });
    response.success(res, doc, 'Marked as read');
  } catch (err) {
    next(err);
  }
};
