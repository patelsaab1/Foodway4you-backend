import Restaurant from "../models/Restaurant.js";
import response from "../utils/responseHelper.js";

// ================= GET ALL RESTAURANTS =================
export const getAllRestaurants = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let filter = {};

    // 🔍 Search by name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 🔥 Filter by active/block
    if (status === "active") filter.isActive = true;
    if (status === "blocked") filter.isActive = false;

    const restaurants = await Restaurant.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return response.success(res, restaurants, "Restaurants fetched");
  } catch (err) {
    next(err);
  }
};



// ================= APPROVE / REJECT =================
export const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    // allowed: approved / rejected
    if (!["approved", "rejected"].includes(status)) {
      return response.error(res, "Invalid status", 400);
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return response.notFound(res, "Restaurant not found");

    // 🔥 onboarding object ensure
    restaurant.onboarding = {
      ...restaurant.onboarding,
      status,
      approvedAt: status === "approved" ? new Date() : null,
      rejectedAt: status === "rejected" ? new Date() : null,
      rejectionReason: reason || ""
    };

    await restaurant.save();

    return response.success(
      res,
      restaurant,
      `Restaurant ${status} successfully`
    );
  } catch (err) {
    next(err);
  }
};



// ================= BLOCK / UNBLOCK =================
export const toggleBlockRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return response.notFound(res, "Restaurant not found");

    restaurant.isActive = !restaurant.isActive;

    await restaurant.save();

    return response.success(
      res,
      restaurant,
      restaurant.isActive ? "Restaurant unblocked" : "Restaurant blocked"
    );
  } catch (err) {
    next(err);
  }
};