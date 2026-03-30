import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import { calculateDeliveryDistance } from '../utils/googleMaps.js';
import response from '../utils/responseHelper.js';

const BASE_DELIVERY_FEE = 40;
const MAX_FREE_KM = 5;
const EXTRA_CHARGE_PER_KM = 8;

// ====================== 1. PLACE ORDER (Customer) ======================
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

    let restaurantId = typeof restaurant === "object" ? restaurant._id : restaurant;

    // VALIDATIONS
    if (!restaurantId) return response.error(res, "Restaurant ID is required", 400);
    if (!deliveryAddress?.coordinates?.latitude) return response.error(res, "Delivery coordinates required", 400);
    if (!items?.length) return response.error(res, "At least one item required", 400);
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) return response.error(res, "Invalid Restaurant ID format", 400);

    const restaurantData = await Restaurant.findById(restaurantId).select("name location");
    if (!restaurantData) return response.error(res, "Restaurant not found", 404);

    const restaurantCoords = `${restaurantData.location.coordinates[1]},${restaurantData.location.coordinates[0]}`;
    const customerCoords = `${deliveryAddress.coordinates.latitude},${deliveryAddress.coordinates.longitude}`;

    // DISTANCE CALCULATION
    const distanceInfo = await calculateDeliveryDistance(restaurantCoords, customerCoords);

    // FEE CALCULATION
    let deliveryFee = BASE_DELIVERY_FEE;
    if (distanceInfo.distanceKm > MAX_FREE_KM) {
      deliveryFee += Math.ceil(distanceInfo.distanceKm - MAX_FREE_KM) * EXTRA_CHARGE_PER_KM;
    }

    const totalAmount = Number(subtotal) + deliveryFee + Number(tax) - Number(discount);

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
      estimatedDeliveryTime: new Date(Date.now() + (distanceInfo.durationMinutes + 25) * 60 * 1000)
    });

    // UPDATED RESPONSE WITH ORDER ID
    return response.success(res, {
        orderId: newOrder._id, 
        orderNumber: newOrder.orderNumber,
        deliveryDistance: distanceInfo.distanceKm,
        deliveryFee,
        totalAmount
      }, "Order placed successfully", 201);

  } catch (err) {
    next(err);
  }
};

// ====================== 2. GET RESTAURANT ORDERS (Restaurant Panel) ======================
// Restaurant ko apne saare naye orders dekhne ke liye
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return response.error(res, "Invalid Restaurant ID", 400);
    }

    const orders = await Order.find({ restaurant: restaurantId })
      .populate('customer', 'name phone') // Customer ki details fetch karega
      .sort({ createdAt: -1 }); // Latest orders pehle

    response.success(res, orders, "Orders fetched for restaurant");
  } catch (err) {
    next(err);
  }
};

// ====================== 3. ACCEPT ORDER (Restaurant Action) ======================
// Jab restaurant 'Accept' button dabaye
export const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'preparing' }, // Status change to preparing
      { new: true }
    );

    if (!order) return response.error(res, "Order not found", 404);

    response.success(res, order, 'Order accepted. Kitchen is preparing food.');
  } catch (err) {
    next(err);
  }
};

// ====================== 4. TRACK & OTHERS ======================
export const track = async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id)
      .select('orderNumber status deliveryDistance estimatedDeliveryTime totalAmount')
      .populate('restaurant', 'name');
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc);
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const doc = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc, 'Order status updated');
  } catch (err) { next(err); }
};

export const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason?.trim()) return response.error(res, "Cancellation reason required", 400);
    const doc = await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled', cancellationReason: reason.trim() }, { new: true });
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc, 'Order cancelled');
  } catch (err) { next(err); }
};