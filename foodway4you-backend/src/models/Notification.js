import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["order", "payment", "delivery", "promotion", "system"],
      default: "system",
      index: true
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    },

    isPushSent: {
      type: Boolean,
      default: false
    },

    pushToken: {
      type: String,
      default: null
    },

    sentAt: {
      type: Date,
      default: Date.now
    },

    readAt: {
      type: Date,
      default: null
    },

    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Notification", notificationSchema);