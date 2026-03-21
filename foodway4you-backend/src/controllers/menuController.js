import MenuItem from '../models/MenuItem.js';
import response from '../utils/responseHelper.js';

export const create = async (req, res, next) => {
  try {
    const doc = await MenuItem.create(req.body);
    response.success(res, doc, 'Created', 201);
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.restaurant) filter.restaurant = req.query.restaurant;
    const docs = await MenuItem.find(filter).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const doc = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const doc = await MenuItem.findByIdAndDelete(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, null, 'Deleted');
  } catch (err) {
    next(err);
  }
};
