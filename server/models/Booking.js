const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    serviceDescription: { type: String, required: true, trim: true, maxlength: 1000 },
    requestedDate: { type: Date, required: true },
    requestedTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
