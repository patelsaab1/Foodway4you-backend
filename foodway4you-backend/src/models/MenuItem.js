const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['starter', 'main-course', 'dessert', 'beverage', 'snack', 'combo']
  },
  cuisine: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  isVeg: {
    type: Boolean,
    required: true,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  nutritionalInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);