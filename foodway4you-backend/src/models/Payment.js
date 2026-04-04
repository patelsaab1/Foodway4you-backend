import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'wallet'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ["razorpay", "stripe", "paytm", "none"],
    default: "none"
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  codCollected: {
    type: Boolean,
    default: false
  },
  failureReason: {
    type: String,
    default: null
  },
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String,
    default: null
  },
  metadata: {
    type: Object,
    default: {}
  },
  //change  
  restaurant: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},
deliveryBoy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null
},
orderType: {
  type: String,
  enum: ['delivery', 'pickup'],
  default: 'delivery'
},
companyAmount: {
  type: Number,
  default: 0
},
restaurantAmount: {
  type: Number,
  default: 0
},

deliveryBoyPaidToCompany: {
  type: Boolean,
  default: false
},
adminVerifiedCOD: {
  type: Boolean,
  default: false
},
handoverScreenshot: {
  type: String, 
  default: null
},

}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);
