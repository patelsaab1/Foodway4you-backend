import Review from '../models/Review.js';
import response from '../utils/responseHelper.js';

export const create = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    const doc = await Review.create(payload);
    response.success(res, doc, 'Review added', 201);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    const docs = await Review.find(filter).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};
