const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "ProviderProfile", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    photos: [{ type: String }],
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ providerId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
