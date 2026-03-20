const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const response = require('../utils/responseHelper');

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return response.error(res, 'User already exists', 400);
    const user = await User.create({ name, email, phone, password, role });
    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    response.success(res, { user: { id: user.id, email: user.email } }, 'Registered');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return response.error(res, 'Invalid credentials', 401);
    const match = await user.matchPassword(password);
    if (!match) return response.error(res, 'Invalid credentials', 401);
    const tokens = generateTokens(user.id);
    response.success(res, { tokens, user: { id: user.id, role: user.role } }, 'Logged in');
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    response.error(res, 'Not implemented', 501);
  } catch (err) {
    next(err);
  }
};

