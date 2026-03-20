const Payment = require('../models/Payment');
const response = require('../utils/responseHelper');
const razorpay = require('../config/razorpay');

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, currency, receipt } = req.body;
    const order = await razorpay.orders.create({ amount, currency: currency || 'INR', receipt });
    response.success(res, order, 'Razorpay order created', 201);
  } catch (err) {
    next(err);
  }
};

exports.verify = async (req, res, next) => {
  try {
    response.error(res, 'Not implemented', 501);
  } catch (err) {
    next(err);
  }
};

