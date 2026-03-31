import MenuItem from '../models/MenuItem.js';
import response from '../utils/responseHelper.js';
// change 
import Restaurant from '../models/Restaurant.js';

export const create = async (req, res, next) => {
  try {
     //change
     const restaurant = await Restaurant.findById(req.body.restaurant);

     if (!restaurant || 
    restaurant.onboarding.status !== "approved" || 
    !restaurant.isActive) {
  return response.error(res, "Restaurant not available", 400);
   }

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
    if (filter.restaurant) {
  const restaurant = await Restaurant.findById(filter.restaurant);

  if (!restaurant || 
      restaurant.onboarding.status !== "approved" || 
      !restaurant.isActive) {
    return response.success(res, []); 
  }
}

const docs = await MenuItem.find(filter).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {

const menu = await MenuItem.findById(req.params.id);
if (!menu) return response.notFound(res);

const restaurant = await Restaurant.findById(menu.restaurant);

if (!restaurant || restaurant.owner.toString() !== req.user.id) {
  return response.error(res, "Not allowed", 403);
}

const doc = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
if (!menu) return response.notFound(res);

const restaurant = await Restaurant.findById(menu.restaurant);

if (!restaurant || restaurant.owner.toString() !== req.user.id) {
  return response.error(res, "Not allowed", 403);
}

const doc = await MenuItem.findByIdAndDelete(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, null, 'Deleted');
  } catch (err) {
    next(err);
  }
};
