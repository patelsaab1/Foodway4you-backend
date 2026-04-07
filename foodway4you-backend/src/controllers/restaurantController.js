import Restaurant from '../models/Restaurant.js';
import response from '../utils/responseHelper.js';
import Support from '../models/Support.js';
import Payout from '../models/Payout.js';
import Order from '../models/Order.js';


const normalizePhone = (value) => (value || '').toString().trim();
const normalizeEmail = (value) => (value || '').toString().trim().toLowerCase();

export const create = async (req, res, next) => {
  try {
    const {
      restaurantName,
      restaurantType,
      address,
      plan,
      latitude,
      longitude,

      // KYC fields
      aadharCard,
      panCard,
      gstNumber,
      fssaiLicense,
      bankName,
      accountNumber,
      ifscCode
    } = req.body;

    // ✅ ADD 1: 5KM restriction logic
    if (latitude && longitude && restaurantType) {
      const nearbyRestaurant = await Restaurant.findOne({
        restaurantType,
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)]
            },
            $maxDistance: 5000
          }
        }
      });

      if (nearbyRestaurant) {
        return response.error(
          res,
          "Registration not allowed. This category already exists in 5km area.",
          400
        );
      }
    }

    // ✅ ADD 2: proper data object (first code ke according)
    const data = {
      owner: req.user.id,
      name: restaurantName,
      restaurantType,
      address,
      plan,

      location: {
        type: "Point",
        coordinates: [Number(longitude) || 0, Number(latitude) || 0]
      },

      // ✅ KYC structure
      kyc: {
        legalName: restaurantName,
        aadharNumber: aadharCard,
        panNumber: panCard,
        gstNumber: gstNumber,
        fssaiNumber: fssaiLicense,
        bank: {
          bankName: bankName,
          accountHolderName: restaurantName,
          accountNumber: accountNumber,
          ifscCode: ifscCode
        }
      }
    };

    // 🔴 EXISTING LINE (unchanged)
    const doc = await Restaurant.create(data);

    // applying socketio
    const io = req.app.get("io");
    io.emit("restaurant:new", {
      restaurantId: doc._id,
      name: doc.name
    });

    response.success(res, doc, 'Created', 201);
  } catch (err) {
    next(err);
  }
}

export const getDashboardStats = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return response.error(res, "Restaurant nahi mila", 404);

    const restaurantId = restaurant._id;
    const { timeRange = '7days' } = req.query;

    let startDate = new Date();
    if (timeRange === 'today') startDate.setHours(0, 0, 0, 0);
    else if (timeRange === '7days') startDate.setDate(startDate.getDate() - 7);
    else if (timeRange === 'month') startDate.setMonth(startDate.getMonth() - 1);
    const recentOrders = await Order.find({ restaurant: restaurantId })
      .sort('-createdAt')
      .limit(5)
      .populate('customer', 'name');

    const kpiStats = await Order.aggregate([
      { $match: { restaurant: restaurantId, status: 'delivered', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $count: {} },
          uniqueCustomers: { $addToSet: "$customer" }
        }
      }
    ]);

    const revenueHistory = await Order.aggregate([
      { $match: { restaurant: restaurantId, status: 'delivered', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { time: "$_id", revenue: 1, orders: 1, _id: 0 } }
    ]);

    const topDishes = await Order.aggregate([
      { $match: { restaurant: restaurantId, status: 'delivered' } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          orders: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'details' } },
      { $unwind: "$details" },
      { $project: { name: "$details.name", orders: 1, revenue: 1, _id: 0 } },
      { $sort: { orders: -1 } },
      { $limit: 5 }
    ]);

    const categoryData = await Order.aggregate([
      { $match: { restaurant: restaurantId, status: 'delivered' } },
      { $unwind: "$items" },
      { $lookup: { from: 'menuitems', localField: 'items.menuItem', foreignField: '_id', as: 'menuDetails' } },
      { $unwind: "$menuDetails" },
      {
        $group: {
          _id: "$menuDetails.category",
          value: { $sum: 1 }
        }
      },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    const peakHours = await Order.aggregate([
      { $match: { restaurant: restaurantId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $project: { hour: { $concat: [{ $toString: "$_id" }, ":00"] }, orders: 1, _id: 0 } }
    ]);

    const finalStats = {
      restaurantName: restaurant.name,
      totalRevenue: kpiStats[0]?.totalRevenue || 0,
      totalOrders: kpiStats[0]?.totalOrders || 0,
      totalCustomers: kpiStats[0]?.uniqueCustomers?.length || 0,
      avgOrderValue: kpiStats[0]?.totalOrders ? Math.round(kpiStats[0]?.totalRevenue / kpiStats[0]?.totalOrders) : 0,
      avgRating: restaurant.ratings || 4.5,
      revenueHistory: revenueHistory.length > 0 ? revenueHistory : [{ time: "No Data", revenue: 0 }],
      topDishes: topDishes,
      categoryBreakdown: categoryData,
      peakHours: peakHours,
      recentOrders: recentOrders.map(o => ({
        orderId: o.orderNumber || o._id,
        customerName: o.customer?.name || "Guest User",
        amount: o.totalAmount,
        status: o.status
      })),
      status: restaurant?.onboarding?.status || 'pending',
    };

    return response.success(res, finalStats);
  } catch (err) { next(err); }
};

export const list = async (req, res, next) => {
  try {
    // const docs = await Restaurant.find().sort({ createdAt: -1 });
    const docs = await Restaurant.find({
  "onboarding.status": "approved",
  isActive: true
}).sort({ createdAt: -1 });
    response.success(res, docs);
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const doc = await Restaurant.findOne({ owner: req.user.id });
    return response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const onboard = async (req, res, next) => {
  try {
    const payload = { ...req.body, owner: req.user.id };
    if (payload?.contact?.phone) payload.contact.phone = normalizePhone(payload.contact.phone);
    if (payload?.contact?.email) payload.contact.email = normalizeEmail(payload.contact.email);

    const doc = await Restaurant.findOneAndUpdate(
      { owner: req.user.id },
      {
        $set: {
          ...payload,
          'onboarding.status': 'pending',
        },
      },
      {  new: true, runValidators: true }
    );

    return response.success(res, doc, 'Onboarding saved');
  } catch (err) {
    next(err);
  }
};

export const submitKyc = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return response.error(res, 'Restaurant onboarding not found', 404);

    const { kyc } = req.body || {};
    if (!kyc) return response.error(res, 'KYC payload required', 400);

    restaurant.kyc = {
      ...restaurant.kyc?.toObject?.(),
      ...kyc,
      documents: { ...(restaurant.kyc?.documents?.toObject?.() || {}), ...(kyc.documents || {}) },
      bank: { ...(restaurant.kyc?.bank?.toObject?.() || {}), ...(kyc.bank || {}) },
    };

    restaurant.onboarding = {
      ...restaurant.onboarding?.toObject?.(),
      status: 'pending',
      submittedAt: new Date(),
      rejectedAt: null,
      rejectionReason: '',
    };

    await restaurant.save();
    // socketio
    const io = req.app.get("io");
    io.emit("restaurant:kycSubmitted", {
      restaurantId: restaurant._id,
      owner: restaurant.owner
    });
    return response.success(res, restaurant, 'KYC submitted');
  } catch (err) {
    next(err);
  }
};

export const kycStatus = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id }).select('onboarding kyc owner');
    if (!restaurant) return response.error(res, 'Restaurant onboarding not found', 404);
    return response.success(res, { onboarding: restaurant.onboarding, kyc: restaurant.kyc });
  } catch (err) {
    next(err);
  }
};

export const get = async (req, res, next) => {
  try {
    // const doc = await Restaurant.findById(req.params.id);
    // if (!doc) return response.notFound(res);
    // response.success(res, doc);
    const doc = await Restaurant.findById(req.params.id);

if (!doc || 
    doc.onboarding.status !== "approved" || 
    !doc.isActive) {
  return response.error(res, "Restaurant not available", 404);
}
response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return response.notFound(res);
    response.success(res, doc, 'Updated');
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const doc = await Restaurant.findByIdAndDelete(req.params.id);
    if (!doc) return response.notFound(res);
    response.success(res, null, 'Deleted');
  } catch (err) {
    next(err);
  }
};

export const submitSupportTicket = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return response.error(res, "Restaurant nahi mila", 404);

    const ticket = await Support.create({
      restaurant: restaurant._id,
      subject: req.body.subject,
      message: req.body.message
    });

    return response.success(res, ticket, 'Ticket submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};


export const getPayouts = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return response.error(res, "Restaurant not found", 404);
    const { filter = 'weekly' } = req.query;
    const payouts = await Payout.find({
      restaurant: restaurant._id,
      filterType: filter
    }).sort({ createdAt: -1 });

    return response.success(res, payouts, "Payouts fetched successfully");
  } catch (err) {
    next(err);
  }
};