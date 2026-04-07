import MenuItem from '../models/MenuItem.js';
import response from '../utils/responseHelper.js';
import Restaurant from '../models/Restaurant.js';

// 1. CREATE DISH
export const create = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    
    if (!restaurant || restaurant.onboarding.status !== "approved" || !restaurant.isActive) {
      return response.error(res, "Restaurant not available or not approved", 400);
    }

    const { name, price, category, description, cuisine, isVeg, isAvailable } = req.body;

    // Data prepare karein (Image path aur Type conversion ke saath)
    const dishData = {
      name,
      price: Number(price),
      category,
      description,
      cuisine,
      isVeg: isVeg === 'true' || isVeg === true,
      isAvailable: isAvailable === 'true' || isAvailable === true,
      restaurant: restaurant._id,
      image: req.file ? req.file.path.replace(/\\/g, "/") : undefined
    };

    // dishData use karein na ki req.body
    const doc = await MenuItem.create(dishData);
    response.success(res, doc, 'Dish Created Successfully', 201);
  } catch (err) {
    next(err);
  }
};

// 2. LIST DISHES
export const list = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return response.success(res, [], "Restaurant nahi mila");
    }

    // filter define kiya (By restaurant ID)
    const docs = await MenuItem.find({ restaurant: restaurant._id }).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

// 3. UPDATE DISH
export const update = async (req, res, next) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return response.notFound(res);

    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    // Ownership check: Kya ye dish isi restaurant ki hai?
    if (!restaurant || menu.restaurant.toString() !== restaurant._id.toString()) {
      return response.error(res, "Not allowed to update this dish", 403);
    }

    const updateData = { ...req.body };
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.isVeg !== undefined) updateData.isVeg = (updateData.isVeg === 'true' || updateData.isVeg === true);
    if (updateData.isAvailable !== undefined) updateData.isAvailable = (updateData.isAvailable === 'true' || updateData.isAvailable === true);
    
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    delete updateData.restaurant; // Restaurant change karna allow nahi hai

    const doc = await MenuItem.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    response.success(res, doc, 'Dish Updated');
  } catch (err) {
    next(err);
  }
};

// 4. REMOVE DISH
export const remove = async (req, res, next) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return response.notFound(res);

    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    // Safety check
    if (!restaurant || menu.restaurant.toString() !== restaurant._id.toString()) {
      return response.error(res, "Not allowed to delete this dish", 403);
    }

    await MenuItem.findByIdAndDelete(req.params.id);
    response.success(res, null, 'Dish Deleted');
  } catch (err) {
    next(err);
  }
};