const Review = require('../models/Review');
const response = require('../utils/responseHelper');

exports.create = async (req, res, next) => {
  try {
    const payload = { ...req.body, user: req.user.id };
    const doc = await Review.create(payload);
    response.success(res, doc, 'Review added', 201);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    const docs = await Review.find(filter).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

