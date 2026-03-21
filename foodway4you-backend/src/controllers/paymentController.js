import response from '../utils/responseHelper.js';
import { getRazorpay } from '../config/razorpay.js';

export const createOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return response.error(res, 'Razorpay is not configured', 503);
    const { amount, currency, receipt } = req.body;
    const order = await razorpay.orders.create({ amount, currency: currency || 'INR', receipt });
    response.success(res, order, 'Razorpay order created', 201);
  } catch (err) {
    next(err);
  }
};

export const verify = async (req, res, next) => {
  try {
    response.error(res, 'Not implemented', 501);
  } catch (err) {
    next(err);
  }
};
