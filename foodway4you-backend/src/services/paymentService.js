const razorpay = require('../config/razorpay');

const createOrder = (params) => razorpay.orders.create(params);

module.exports = { createOrder };

