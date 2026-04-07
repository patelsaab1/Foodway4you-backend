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

  customerName: {
    type: String
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
      'pending', 'confirmed', 'preparing', 'ready',
      'picked-up', 'on-the-way', 'delivered', 'cancelled'
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

  paymentMode: {
    type: String
  },

  subtotal: { type: Number, required: true, default: 0 },
  deliveryFee: { type: Number, required: true, default: 0 },
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

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'FW4U' + Date.now().toString().slice(-8);
  }

  if (this.paymentMethod) {
    this.paymentMode = this.paymentMethod.toUpperCase();
  }

  const sub = Number(this.subtotal) || 0;
  const tax = Number(this.tax) || 0;
  const fee = Number(this.deliveryFee) || 0;
  const disc = Number(this.discount) || 0;

  this.totalAmount = sub + tax + fee - disc;

  next();
});

orderSchema.index({ customer: 1, status: 1 });
orderSchema.index({ restaurant: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;