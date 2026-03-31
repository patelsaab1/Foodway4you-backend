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

// ================= GET ALL RESTAURANTS =================
export const getAllRestaurants = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { status, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    // Search 
    if (search) {
      filter.name = { $regex: new RegExp(search, "i") };
    }

    //  Active / Blocked
    if (status === "active") filter.isActive = true;
    if (status === "blocked") filter.isActive = false;

    //  Pagination
    const skip = (page - 1) * limit;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .populate("owner", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(), 
      Restaurant.countDocuments(filter),
    ]);

    return response.success(res, {
      data: restaurants,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    }, "Restaurants fetched");

  } catch (err) {
    next(err);
  }
};

// ================= APPROVE / REJECT =================
export const updateRestaurantStatus = async (req, res, next) => {
  try {
    if (!isAdmin(req, res)) return;

    const { status, reason } = req.body;

    //  Validate status
    if (!["approved", "rejected"].includes(status)) {
      return response.error(res, "Invalid status", 400);
    }

    //  Fetch first (IMPORTANT for checks)
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return response.notFound(res, "Restaurant not found");
    }

    //  Prevent re-processing (VERY IMPORTANT)
    if (restaurant.onboarding.status !== "pending") {
      return response.error(res, "Already processed", 400);
    }

    //  Reject → reason mandatory
    if (status === "rejected" && !reason?.trim()) {
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
      restaurant.onboarding.rejectionReason = reason.trim();
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