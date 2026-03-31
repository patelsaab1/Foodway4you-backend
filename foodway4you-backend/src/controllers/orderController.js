import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import response from '../utils/responseHelper.js';
import { send } from '../services/emailService.js';

// ====================== 1. CUSTOMER: PLACE ORDER ======================
export const place = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, customer: req.user.id });
    return response.success(res, order, 'Order placed successfully', 201);
  } catch (err) { next(err); }
};

// ====================== 2. RESTAURANT: CONFIRM ORDER ======================
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true, runValidators: true }
    );
    if (!order) return response.error(res, "Order not found", 404);
    return response.success(res, order, 'Order confirmed by restaurant');
  } catch (err) { next(err); }
};

// ====================== 3. KITCHEN: START PREPARING ======================
export const startPreparing = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'preparing' },
      { new: true, runValidators: true }
    );
    if (!order) return response.error(res, "Order not found", 404);
    return response.success(res, order, 'Chef has started cooking');
  } catch (err) { next(err); }
};

// ====================== 4. KITCHEN: ORDER READY & NOTIFY RIDERS ======================
export const orderReady = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'ready' },
      { new: true, runValidators: true }
    ).populate('restaurant', 'name');

    if (!order) return response.error(res, "Order not found", 404);

    const { testEmail } = req.body;
    let riders = testEmail ? [{ email: testEmail }] : await User.find({ role: 'rider' }).select('email');

    if (riders.length > 0) {
      const BASE_URL = "http://localhost:5000"; 
      riders.map(async (rider) => {
        const acceptUrl = `${BASE_URL}/api/v1/orders/${order._id}/rider-accept?email=${rider.email}`;
        const html = `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 40px; text-align: center;">
            <h1 style="font-weight: 300; letter-spacing: 4px; text-transform: uppercase;">Ready for Pickup</h1>
            <p>Order #${order.orderNumber} is ready at ${order.restaurant?.name}.</p>
            <a href="${acceptUrl}" style="background: #000; color: #fff; padding: 15px 35px; text-decoration: none; display: inline-block; font-weight: bold;">ACCEPT ORDER</a>
          </div>`;
        await send({ to: rider.email, subject: "Delivery Opportunity", html });
      });
    }
    return response.success(res, order, 'Order marked as ready. Riders notified.');
  } catch (err) { next(err); }
};

// ====================== 5. RIDER: ACCEPT (EMAIL LINK) ======================
export const riderAcceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const order = await Order.findById(id).populate('restaurant', 'name');
    if (!order) return res.status(404).send("Order not found");
    if (order.deliveryPartner) return res.send("<h1>Order already taken.</h1>");

    const rider = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!rider) return res.status(404).send("<h1>Rider not found</h1>");

    order.deliveryPartner = rider._id;
    order.status = 'picked-up';
    await order.save();

    return res.send(`
      <div style="text-align:center; padding:100px; font-family:sans-serif; background:#fff;">
        <h1 style="font-weight: 300; letter-spacing: 5px; text-transform: uppercase;">Picked Up</h1>
        <p>Order #${order.orderNumber} is assigned to you.</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
};

// ====================== 6. RIDER: START DELIVERY (ON-THE-WAY) ======================
export const startDelivery = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'on-the-way' },
      { new: true, runValidators: true }
    );
    if (!order) return response.error(res, "Order not found", 404);
    return response.success(res, order, 'Rider is on the way');
  } catch (err) { next(err); }
};

// ====================== 7. RIDER: COMPLETE (DELIVERED) ======================
export const completeOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'delivered', paymentStatus: 'paid' },
      { new: true, runValidators: true }
    );
    if (!order) return response.error(res, "Order not found", 404);
    return response.success(res, order, 'Order delivered successfully');
  } catch (err) { next(err); }
};

// ====================== 8. SMART TRACKING ======================
export const track = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('restaurant', 'name location')
      .populate('deliveryPartner', 'name phone');

    if (!order) return response.error(res, "Order not found", 404);

    const statusMessages = {
      'pending': 'Waiting for restaurant to confirm...',
      'confirmed': 'Restaurant has accepted your order.',
      'preparing': 'Chef is working their magic!',
      'ready': 'Food is packed and ready for pickup.',
      'picked-up': 'Rider has picked up your order.',
      'on-the-way': 'Rider is zooming towards you!',
      'delivered': 'Enjoy your meal!',
      'cancelled': 'This order was cancelled.'
    };

    return response.success(res, {
      ...order._doc,
      statusMessage: statusMessages[order.status] || 'Processing...'
    }, "Tracking info fetched");
  } catch (err) { next(err); }
};

// ====================== 9. CANCEL WITH GUARD ======================
export const cancel = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return response.error(res, "Order not found", 404);

    const restrictedStatuses = ['picked-up', 'on-the-way', 'delivered'];
    if (restrictedStatuses.includes(order.status)) {
      return response.error(res, `Cannot cancel order. It is already ${order.status}`, 400);
    }

    order.status = 'cancelled';
    await order.save();
    return response.success(res, order, 'Order cancelled successfully');
  } catch (err) { next(err); }
};

// ====================== 10. ADDITIONAL UTILS ======================
export const getRestaurantOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ restaurant: req.params.restaurantId }).sort('-createdAt');
    return response.success(res, orders, 'Restaurant orders fetched');
  } catch (err) { next(err); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true, runValidators: true }
    );
    if (!order) return response.error(res, "Order not found", 404);
    return response.success(res, order, `Status updated to ${req.body.status}`);
  } catch (err) { next(err); }
};