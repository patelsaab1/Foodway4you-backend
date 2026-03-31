import response from '../utils/responseHelper.js';
import { getRazorpay } from '../config/razorpay.js';
import Payment from "../models/Payment.js";

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

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("User", "name email")
      .populate("Order");

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
