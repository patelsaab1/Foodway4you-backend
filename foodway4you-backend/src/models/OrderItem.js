import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
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
  },
  status: {
    type: String,
    enum: ['pending','confirmed', 'preparing', 'ready', 'assigned','pickup','outofdelivered','delivered','cancelled ', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.model('OrderItem', orderItemSchema);
