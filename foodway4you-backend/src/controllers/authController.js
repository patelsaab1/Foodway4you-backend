import User from '../models/User.js';
import crypto from 'node:crypto';
import generateTokens from '../utils/generateToken.js';
import generateOTP from '../utils/generateOTP.js';
import response from '../utils/responseHelper.js';
import { send as sendEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import { getFirebaseAdmin } from '../config/firebase.js';
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const buildResetPasswordEmailHtml = ({ name, resetUrl }) => {
  const safeName = name || 'User';
  const safeUrl = resetUrl;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: Arial, sans-serif; background: #f6f7fb; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e9ecf5;">
      <h2 style="margin: 0 0 12px;">Reset your password</h2>
      <p style="margin: 0 0 16px;">Hi ${safeName},</p>
      <p style="margin: 0 0 16px;">We received a request to reset your password. Click the button below to set a new password.</p>
      <p style="margin: 0 0 20px;">
        <a href="${safeUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 16px; border-radius: 10px;">Reset Password</a>
      </p>
      <p style="margin: 0 0 8px; color: #475569; font-size: 14px;">If the button doesn't work, copy and paste this link:</p>
      <p style="margin: 0 0 16px; font-size: 12px; color: #334155; word-break: break-all;">${safeUrl}</p>
      <p style="margin: 0; color: #64748b; font-size: 12px;">If you didn’t request this, you can ignore this email.</p>
    </div>
  </body>
</html>`;
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (role && !['customer', 'restaurant', 'rider', 'admin'].includes(role)) {
      return response.error(res, 'Invalid role', 400);
    }
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

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return response.error(res, 'Invalid credentials', 401);
    const match = await user.matchPassword(password);
    if (!match) return response.error(res, 'Invalid credentials', 401);
         
    const { accessToken, refreshToken,expiresAt } = generateTokens(user.id);

    
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();
    response.success(res, { tokens:{ accessToken, refreshToken}, user: { id: user.id, role: user.role } }, 'Logged in');
  } catch (err) {
    next(err);
  }
};
export const phoneLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const admin = getFirebaseAdmin();

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const verifiedPhone = decodedToken.phone_number; 

    if (!verifiedPhone) {
      return response.error(res, 'Authentication failed: No phone number found', 401);
    }

    let user = await User.findOne({ phone: verifiedPhone });

    if (!user) {
      user = await User.create({
        name: 'Guest User', 
        phone: verifiedPhone, 
        isVerified: true,
        role: 'customer',
        password: crypto.randomBytes(16).toString('hex'),
      });
    }

    const { accessToken, refreshToken, expiresAt } = generateTokens(user.id);
    user.refreshTokens.push({ token: refreshToken, expiresAt });
    await user.save();

    response.success(res, { tokens: { accessToken, refreshToken }, user }, 'Login Successful');

  } catch (error) {
  
    console.error('Phone Login Error:', error);
    
    next(error); 
  }
};
// ---------------- REFRESH ----------------
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return response.error(res, 'Refresh token required', 400);

  
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return response.error(res, 'Invalid refresh token', 401);
    }

    
    const user = await User.findOne({
      _id: payload.id,
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) return response.error(res, 'Invalid or expired refresh token', 401);

    
    const { accessToken, refreshToken: newRefreshToken,expiresAt } = generateTokens(user.id);

    

    
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt });
    user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
    await user.save();

    response.success(res, {
      tokens: { accessToken, refreshToken: newRefreshToken }
    }, 'Tokens refreshed');

  } catch (err) {
    next(err);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return response.success(res, null, 'If the email exists, a reset link has been sent');

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);

    user.resetPasswordOTP = tokenHash;
    user.resetPasswordOTPExpire = new Date(Date.now() + 15 * 60 * 1000);
    user.resetPasswordTokenUsedAt = null;
    await user.save();

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const resetUrl = `${normalizedBaseUrl}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: buildResetPasswordEmailHtml({ name: user.name, resetUrl }),
    });

    return response.success(res, null, 'If the email exists, a reset link has been sent');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    const user = await User.findOne({
      resetPasswordOTP: tokenHash,
      resetPasswordOTPExpire: { $gt: new Date() },
    });

    if (!user) return response.error(res, 'Invalid or expired token', 400);

    user.password = password;
    user.resetPasswordTokenUsedAt = new Date();
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;
    await user.save();

    return response.success(res, null, 'Password updated');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, fcmToken } = req.body;

    if (phone && phone !== req.user.phone) {
      const exists = await User.findOne({ phone });
      if (exists) return response.error(res, 'Phone already in use', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(fcmToken !== undefined && { fcmToken }),
      },
      { new: true, runValidators: true, select: '-password' }
    );

    return response.success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};


