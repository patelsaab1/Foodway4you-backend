import { getRazorpay } from '../config/razorpay.js';

const createOrder = (params) => {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay is not configured');
  return razorpay.orders.create(params);
};


export { createOrder };
