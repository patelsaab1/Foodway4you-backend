const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  cuisine: [{
    type: String,
    required: true
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  images: [{
    type: String
  }],
  logo: {
    type: String
  },
  openingHours: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    open: { type: String, required: true },
    close: { type: String, required: true },
    isClosed: { type: Boolean, default: false }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Restaurant', restaurantSchema);