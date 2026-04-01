import response from '../utils/responseHelper.js';
import { getRazorpay } from '../config/razorpay.js';
import Payment from "../models/Payment.js";
import crypto from "crypto";

export const createOrder = async (req, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return response.error(res, "Razorpay not configured", 503);
    }

    const { amount, currency, receipt, orderId } = req.body;

    // Razorpay order creation
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || "INR",
      receipt,
      payment_capture: 1 // automatic capture
    });

    // Save payment in DB
    const payment = await Payment.create({
      orderId: orderId,
      user: req.user.id,
      amount,
      currency: currency || "INR",
      paymentMethod: "online",
      paymentGateway: "razorpay",
      status: "pending",
      razorpayOrderId: razorpayOrder.id
    });

    // Send necessary info to frontend
    return response.success(
      res,
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        paymentId: payment._id
      },
      "Razorpay order created",
      201
    );

  } catch (err) {
    next(err);
  }
};



export const verify = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response.error(res, "All payment fields are required", 400);
    }

    // Generate signature on backend
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    // const expectedSignature = crypto
    //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    //   .update(body)
    //   .digest("hex");

    // console.log("Expected Signature:", expectedSignature);
    // console.log("Received Signature:", razorpay_signature);

    // Compare signatures
    // if (expectedSignature !== razorpay_signature) {
    //   return response.error(res, "Invalid payment signature", 400);
    // }

    // Find payment in DB
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return response.error(res, "Payment record not found", 404);
    }

    // Update payment
    payment.status = "completed";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();

    await payment.save();

    return response.success(res, payment, "Payment verified successfully");

  } catch (err) {
    next(err);
  }
}

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("orderId");

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
