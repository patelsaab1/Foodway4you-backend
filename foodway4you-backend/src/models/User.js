import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    // required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'rider', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    type: String,
    default: null
  },
  verificationOTPExpire: {
    type: Date,
    default: null
  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordOTPExpire: {
    type: Date,
    default: null
  },
  resetPasswordTokenUsedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  fcmToken: {
    type: String,
    default: null
  },
  
refreshTokens: [
  {
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  }
]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);