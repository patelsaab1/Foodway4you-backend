// import Review from '../models/Review.js';
// import response from '../utils/responseHelper.js';

// export const create = async (req, res, next) => {
//   try {
//     const payload = { ...req.body, user: req.user.id };
//     const doc = await Review.create(payload);
//     response.success(res, doc, 'Review added', 201);
//   } catch (err) {
//     next(err);
//   }
// };

// export const list = async (req, res, next) => {
//   try {
//     const filter = {};
//     if (req.query.restaurant) filter.restaurant = req.query.restaurant;
//     const docs = await Review.find(filter).sort({ createdAt: -1 });
//     response.success(res, docs);
//   } catch (err) {
//     next(err);
//   }
// };

import mongoose from 'mongoose';
import Review from '../models/Review.js';
import response from '../utils/responseHelper.js';

// ========================= CREATE REVIEW =========================
export const create = async (req, res, next) => {
  try {
    // Duplicate check: same user same order
    const existing = await Review.findOne({ order: req.body.order, user: req.user.id });
    if (existing) {
      return response.error(res, 'Review already exists for this order', 400);
    }

    const payload = { ...req.body, user: req.user.id };
    const doc = await Review.create(payload);

    // Populate user & restaurant for frontend
    const populatedDoc = await doc.populate('user', 'name avatar')
                                  .populate('restaurant', 'name address');

    response.success(res, populatedDoc, 'Review added successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ========================= LIST REVIEWS =========================
export const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const docs = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('restaurant', 'name address');

    // Total count for frontend pagination
    const total = await Review.countDocuments(filter);

    response.success(res, { reviews: docs, total, page, limit });
  } catch (err) {
    next(err);
  }
};

// ========================= GET AVERAGE RATING =========================
export const averageRating = async (req, res, next) => {
  try {
    if (!req.query.restaurant) {
      return response.error(res, 'Restaurant ID is required', 400);
    }

    const agg = await Review.aggregate([
      { $match: { restaurant: mongoose.Types.ObjectId(req.query.restaurant) } },
      { $group: {
          _id: '$restaurant',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
      }}
    ]);

    const result = agg[0] || { avgRating: 0, count: 0 };
    response.success(res, result);
  } catch (err) {
    next(err);
  }
};
