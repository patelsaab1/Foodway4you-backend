import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },

  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],

  status: {
    type: String,
    enum: [
      'pending','confirmed','preparing','ready',
      'picked-up','on-the-way','delivered','cancelled'
    ],
    default: 'pending',
    index: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'wallet'],
    required: true
  },

  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },

  totalAmount: { type: Number },

  deliveryDistance: {
    type: Number,
    default: 0
  },

  estimatedDuration: {
    type: Number,
    default: 0
  },

  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  }

}, { timestamps: true });


// ✅ Auto Order Number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'FW4U' + Date.now().toString().slice(-8);
  }

  // ✅ Auto total calculation (IMPORTANT)
  this.totalAmount =
    this.subtotal +
    this.tax -
    this.discount +
    this.deliveryFee;

  next();
});

// ✅ Index
orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });

// ✅ FIX Overwrite Error
const Order =
  mongoose.models.Order ||
  mongoose.model('Order', orderSchema);

export default Order;