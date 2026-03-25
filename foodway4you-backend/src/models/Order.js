import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Unique Order ID
  orderNumber: {
    type: String,
    unique: true,
    index: true
  },
  
  // Relationships
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

  // Order Items
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    specialInstructions: {
      type: String,
      default: ''
    }
  }],

  // Order Status
  status: {
    type: String,
    enum: [
      'pending', 
      'confirmed', 
      'preparing', 
      'ready', 
      'picked-up', 
      'on-the-way', 
      'delivered', 
      'cancelled'
    ],
    default: 'pending',
    index: true
  },

  // Payment
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

  // Pricing
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  // Delivery Address
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    landmark: { type: String, default: '' }
  },

  // Timing & Feedback
  estimatedDeliveryTime: { type: Date, default: null },
  actualDeliveryTime: { type: Date, default: null },
  specialInstructions: { type: String, default: '' },
  cancellationReason: { type: String, default: '', trim: true },
  rating: { type: Number, min: 1, max: 5, default: null },
  review: { type: String, default: '' }

}, {
  timestamps: true 
});


// Auto-generate Order Number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'FW4U' + Date.now().toString().slice(-8);
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;