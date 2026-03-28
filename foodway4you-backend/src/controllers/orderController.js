import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { calculateDeliveryDistance } from '../utils/googleMaps.js';
import response from '../utils/responseHelper.js';

const BASE_DELIVERY_FEE = 40;
const MAX_FREE_KM = 5;
const EXTRA_CHARGE_PER_KM = 8;

// ====================== PLACE ORDER ======================
export const place = async (req, res, next) => {
  try {
    let { 
      restaurant, 
      deliveryAddress, 
      items, 
      subtotal, 
      tax = 0, 
      discount = 0, 
      paymentMethod = 'cod',
      specialInstructions = '' 
    } = req.body;

    console.log("🔥 PLACE ORDER HIT");

    // HANDLE OBJECT / STRING
    let restaurantId = restaurant;

    if (typeof restaurantId === "object" && restaurantId._id) {
      restaurantId = restaurantId._id;
    }

    console.log("Restaurant ID:", restaurantId);

    // VALIDATION
    if (!restaurantId) {
      return response.error(res, "Restaurant ID is required", 400);
    }

    if (
      deliveryAddress?.coordinates?.latitude == null ||
      deliveryAddress?.coordinates?.longitude == null
    ) {
      return response.error(res, "Delivery coordinates required", 400);
    }

    if (!items || items.length === 0) {
      return response.error(res, "At least one item required", 400);
    }

    if (!subtotal || subtotal <= 0) {
      return response.error(res, "Valid subtotal required", 400);
    }

    // OBJECT ID VALIDATION
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return response.error(res, "Invalid Restaurant ID format", 400);
    }

    // GET RESTAURANT
    const restaurantData = await Restaurant.findById(restaurantId)
      .select("name location");

    if (!restaurantData) {
      return response.error(res, "Restaurant not found", 404);
    }

    if (!restaurantData.location?.coordinates) {
      return response.error(res, "Restaurant location missing", 400);
    }

    // COORDINATES
    const restaurantCoords = `${restaurantData.location.coordinates[1]},${restaurantData.location.coordinates[0]}`;
    const customerCoords = `${deliveryAddress.coordinates.latitude},${deliveryAddress.coordinates.longitude}`;

    console.log("Restaurant Coords:", restaurantCoords);
    console.log("Customer Coords:", customerCoords);

    // DISTANCE
    let distanceInfo;

    try {
      distanceInfo = await calculateDeliveryDistance(
        restaurantCoords,
        customerCoords
      );
    } catch (err) {
      console.error("Distance Error:", err.message);
      return response.error(res, "Distance calculation failed", 500);
    }

    console.log("Distance Info:", distanceInfo);

    // DELIVERY FEE
    let deliveryFee = BASE_DELIVERY_FEE;

    if (distanceInfo.distanceKm > MAX_FREE_KM) {
      const extraKm = distanceInfo.distanceKm - MAX_FREE_KM;
      deliveryFee += Math.ceil(extraKm) * EXTRA_CHARGE_PER_KM;
    }

    // TOTAL
    const totalAmount =
      Number(subtotal) + deliveryFee + Number(tax) - Number(discount);

    // CREATE ORDER
    const newOrder = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      subtotal: Number(subtotal),
      deliveryFee,
      tax: Number(tax),
      discount: Number(discount),
      totalAmount,
      specialInstructions,
      deliveryDistance: distanceInfo.distanceKm,
      estimatedDuration: distanceInfo.durationMinutes,
      estimatedDeliveryTime: new Date(
        Date.now() + (distanceInfo.durationMinutes + 25) * 60 * 1000
      )
    });

    return response.success(
      res,
      {
        orderNumber: newOrder.orderNumber,
        deliveryDistance: distanceInfo.distanceKm,
        deliveryFee,
        estimatedTime: `${distanceInfo.durationMinutes} min`,
        totalAmount
      },
      "Order placed successfully",
      201
    );

  } catch (err) {
    console.error("ORDER ERROR:", err);
    next(err);
  }
};

// ====================== TRACK ======================
export const track = async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id)
      .select('orderNumber status deliveryDistance estimatedDeliveryTime totalAmount')
      .populate('restaurant', 'name');

    if (!doc) {
      return response.error(res, "Order not found", 404);
    }

    response.success(res, doc);
  } catch (err) {
    next(err);
  }
};

// ====================== UPDATE STATUS ======================
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!doc) return response.error(res, "Order not found", 404);

    response.success(res, doc, 'Order status updated');
  } catch (err) {
    next(err);
  }
};

// ====================== CANCEL ======================
export const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason?.trim()) {
      return response.error(res, "Cancellation reason required", 400);
    }

    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancellationReason: reason.trim() },
      { new: true }
    );

    if (!doc) return response.error(res, "Order not found", 404);

    response.success(res, doc, 'Order cancelled');
  } catch (err) {
    next(err);
  }
};