import Restaurant from "../models/Restaurant.js";
import response from "../utils/responseHelper.js";

// ================= COMMON ADMIN CHECK =================
const isAdmin = (req, res) => {
  if (req.user?.role !== "admin") {
    response.error(res, "Access denied", 403);
    return false;
  }
  return true;
};



export const getAllRestaurants = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const restaurants = await Restaurant.find({})
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return response.success(
      res,
      restaurants,
      "All restaurants fetched"
    );

  } catch (err) {
    next(err);
  }
};

// ================= APPROVE / REJECT =================
export const updateRestaurantStatus = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { status, rejectionReason } = req.body;

    //  Validate status
    if (!["approved", "rejected"].includes(status)) {
      return response.error(res, "Invalid status", 400);
    }

    //  Fetch first (IMPORTANT for checks)
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return response.notFound(res, "Restaurant not found");
    }

   

    //  Reject → reason mandatory
    if (status === "rejected" && !rejectionReason?.trim()) {
      return response.error(res, "Rejection reason is required", 400);
    }

    //  Update fields cleanly
    restaurant.onboarding.status = status;

    if (status === "approved") {
      restaurant.onboarding.approvedAt = new Date();
      restaurant.onboarding.rejectedAt = null;
      restaurant.onboarding.rejectionReason = null;
    }

    if (status === "rejected") {
      restaurant.onboarding.rejectedAt = new Date();
      restaurant.onboarding.rejectionReason = rejectionReason.trim();
      restaurant.onboarding.approvedAt = null;
    }

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
    if (!isAdmin(req, res)) return;

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return response.notFound(res, "Restaurant not found");
    }

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


// ================= GET RESTAURANT BY ID =================
export const getRestaurantById = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { id } = req.params;

    const restaurant = await Restaurant.findById(id)
      .populate("owner", "name email phone")
      .lean();

    if (!restaurant) {
      return response.notFound(res, "Restaurant not found");
    }

    return response.success(
      res,
      restaurant,
      "Restaurant fetched successfully"
    );

  } catch (err) {
    next(err);
  }
};