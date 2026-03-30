import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { calculateDeliveryDistance } from '../utils/googleMaps.js';
import response from '../utils/responseHelper.js';
import { send } from '../services/emailService.js';

const BASE_DELIVERY_FEE = 40;
const MAX_FREE_KM = 5;
const EXTRA_CHARGE_PER_KM = 8;

// ====================== 1. PLACE ORDER ======================
export const place = async (req, res, next) => {
  try {
    let { restaurant, deliveryAddress, items, subtotal, tax = 0, discount = 0, paymentMethod = 'cod', specialInstructions = '' } = req.body;
    let restaurantId = typeof restaurant === "object" ? restaurant._id : restaurant;

    if (!restaurantId || !deliveryAddress?.coordinates?.latitude || !items?.length) {
      return response.error(res, "Missing required fields", 400);
    }

    const restaurantData = await Restaurant.findById(restaurantId).select("name location");
    if (!restaurantData) return response.error(res, "Restaurant not found", 404);

    const restaurantCoords = `${restaurantData.location.coordinates[1]},${restaurantData.location.coordinates[0]}`;
    const customerCoords = `${deliveryAddress.coordinates.latitude},${deliveryAddress.coordinates.longitude}`;

    const distanceInfo = await calculateDeliveryDistance(restaurantCoords, customerCoords);

    let deliveryFee = BASE_DELIVERY_FEE;
    if (distanceInfo.distanceKm > MAX_FREE_KM) {
      deliveryFee += Math.ceil(distanceInfo.distanceKm - MAX_FREE_KM) * EXTRA_CHARGE_PER_KM;
    }

    const totalAmount = Number(subtotal) + deliveryFee + Number(tax) - Number(discount);

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

    return response.success(res, { 
      orderId: newOrder._id, 
      orderNumber: newOrder.orderNumber, 
      totalAmount 
    }, "Order placed successfully", 201);
  } catch (err) { next(err); }
};

// ====================== 2. GET RESTAURANT ORDERS ======================
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    response.success(res, orders, "Orders fetched");
  } catch (err) { next(err); }
};

// ====================== 3. ACCEPT ORDER & EMAIL TO RIDERS ======================
export const acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'preparing' },
      { new: true }
    ).populate('restaurant', 'name');

    if (!order) return response.error(res, "Order not found", 404);

    // Riders ko dhundein (Ensure role is 'rider' in DB)
    const deliveryPartners = await User.find({ role: 'rider' }).select('email name');
    
    console.log(`Database mein mile Riders: ${deliveryPartners.length}`);

    if (deliveryPartners.length > 0) {
      const emailSubject = `🚨 New Delivery Request - Order #${order.orderNumber}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #27ae60;">Naya Order Taiyar Hai!</h2>
          <p>Restaurant <b>${order.restaurant.name}</b> ne order confirm kiya hai.</p>
          <hr>
          <p><b>Order No:</b> ${order.orderNumber}</p>
          <p><b>Pickup:</b> ${order.deliveryAddress.street}, ${order.deliveryAddress.city}</p>
          <p><b>Earning:</b> ₹${order.deliveryFee}</p>
          <hr>
          <p>Kripya App par jakar order accept karein.</p>
        </div>`;

      // Email bhejane ka logic
      const emailPromises = deliveryPartners.map(p => {
        console.log(`Email bhej raha hoon: ${p.email}`);
        return send({ 
          to: p.email, 
          subject: emailSubject, 
          html: emailHtml 
        });
      });

      await Promise.all(emailPromises);
      console.log("✅ Sabhi notification emails bhej diye gaye hain.");
    }

    response.success(res, order, 'Order accepted and Partners notified.');
  } catch (err) { next(err); }
};

// ====================== 4. TRACK ORDER ======================
export const track = async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id).populate('restaurant', 'name');
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc);
  } catch (err) { next(err); }
};

// ====================== 5. UPDATE STATUS ======================
export const updateStatus = async (req, res, next) => {
  try {
    const doc = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc, 'Status updated');
  } catch (err) { next(err); }
};

// ====================== 6. CANCEL ORDER ======================
export const cancel = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return response.error(res, "Cancellation reason is required", 400);
    
    const doc = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: 'cancelled', cancellationReason: reason }, 
      { new: true }
    );
    if (!doc) return response.error(res, "Order not found", 404);
    response.success(res, doc, 'Order cancelled');
  } catch (err) { next(err); }
};