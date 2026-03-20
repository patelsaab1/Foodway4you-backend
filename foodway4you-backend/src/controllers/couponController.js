const Coupon = require('../models/Coupon');
const response = require('../utils/responseHelper');

exports.create = async (req, res, next) => {
  try {
    const doc = await Coupon.create(req.body);
    response.success(res, doc, 'Created', 201);
  } catch (err) {
    next(err);
  }
};

exports.apply = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const now = new Date();
    const coupon = await Coupon.findOne({ code, isActive: true, validFrom: { $lte: now }, validUntil: { $gte: now } });
    if (!coupon) return response.error(res, 'Invalid coupon', 400);
    let discount = 0;
    if (coupon.discountType === 'percentage') discount = (amount * coupon.discountValue) / 100;
    if (coupon.discountType === 'fixed') discount = coupon.discountValue;
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    response.success(res, { discount, final: Math.max(0, amount - discount) }, 'Applied');
  } catch (err) {
    next(err);
  }
};

