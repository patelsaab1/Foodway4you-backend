import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Address (Readable)
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    // 🔥 GEO LOCATION (IMPORTANT)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Cuisine
    cuisine: [String],

    // Contact
    contact: {
      phone: String,
      email: String,
    },

    // Media
    images: [String],
    logo: String,

    // Opening Hours
    openingHours: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
        open: String,
        close: String,
        isClosed: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Delivery
    deliveryFee: {
      type: Number,
      default: 0,
    },

    minimumOrder: Number,
    estimatedDeliveryTime: Number,

    // Ratings (future use)
    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔥 KYC (Production Ready)
    kyc: {
      businessType: String,
      legalName: String,
      gstNumber: String,
      panNumber: String,
      fssaiNumber: String,

      documents: {
        panUrl: String,
        gstUrl: String,
        fssaiUrl: String,
        cancelledChequeUrl: String,
        userPhotoUrl: String,
        restaurantPhotoUrl: String,
        signatureUrl: String,
      },

      bank: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
      },
    },
    onboarding: {
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}
    
  },

);

//  GEO INDEX (VERY IMPORTANT)
restaurantSchema.index({ location: "2dsphere" });

export default mongoose.model("Restaurant", restaurantSchema);