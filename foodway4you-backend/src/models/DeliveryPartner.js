const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'car', 'bicycle'],
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  drivingLicense: {
    type: String,
    required: true
  },
  licenseExpiry: {
    type: Date,
    required: true
  },
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  documents: {
    licenseImage: { type: String, default: null },
    vehicleImage: { type: String, default: null },
    profileImage: { type: String, default: null }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);