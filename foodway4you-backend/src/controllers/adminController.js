import User from '../models/User.js';
import  Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import DeliveryPartner from '../models/DeliveryPartner.js'
import response from '../utils/responseHelper.js';

//  DASHBOARD 
export const dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalRestaurants = await Restaurant.countDocuments();
    const totalRiders = await DeliveryPartner.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return response.success(res, {
      totalUsers,
      totalRestaurants,
      totalRiders,
      totalOrders,
      totalRevenue
    }, "Admin dashboard data");

  } catch (err) {
    next(err);
  }
};

//  GET ALL USERS
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 });

    return response.success(res, users, "Users fetched");
  } catch (err) {
    next(err);
  }
};

//  GET SINGLE USER
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -refreshTokens");

    if (!user) return response.notFound(res, "User not found");

    return response.success(res, user);
  } catch (err) {
    next(err);
  }
};

//  BLOCK / UNBLOCK USER
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return response.notFound(res, "User not found");

    if (user.role === "admin") {
      return response.error(res, "Admin cannot be blocked", 400);
    }

    user.isActive = !user.isActive;
    await user.save();

    return response.success(
      res,
      user,
      `User ${user.isActive ? "activated" : "blocked"} successfully`
    );
  } catch (err) {
    next(err);
  }
};

//  4. Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return response.error(res, "User not found", 404);

    response.success(res, null, "User deleted");
  } catch (err) {
    next(err);
  }
};




