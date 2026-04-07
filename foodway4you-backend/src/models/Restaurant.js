import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String,
    },

    restaurantType: {
      type: String,
      enum: ["veg", "non-veg", "fast-food"],
      required: true,
    },

    plan: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      required: true,
    },

    // address: {
    //   type: String,
    //   required: true
    // },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    cuisine: [String],

    contact: {
      phone: String,
      email: String,
    },

    images: [String],
    logo: String,

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

    deliveryFee: {
      type: Number,
      default: 0,
    },

    minimumOrder: Number,
    estimatedDeliveryTime: Number,

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    kyc: {
      businessType: { type: String, default: "Restaurant" },
      legalName: String,
      aadharNumber: String,
      panNumber: String,
      gstNumber: String,
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
        bankName: String,
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
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

export default mongoose.model("Restaurant", restaurantSchema);