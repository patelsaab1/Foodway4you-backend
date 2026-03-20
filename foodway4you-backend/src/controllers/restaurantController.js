const Restaurant = require('../models/Restaurant');
const response = require('../utils/responseHelper');

exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, owner: req.user.id };
    const doc = await Restaurant.create(data);
    response.success(res, doc, 'Created', 201);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const docs = await Restaurant.find().sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const doc = await Restaurant.findById(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Updated');
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndDelete(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, null, 'Deleted');
  } catch (err) {
    next(err);
  }
};

