const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    category: { type: String, required: true, trim: true },
    bio: { type: String, trim: true, maxlength: 1000 },
    location: {
      country: { type: String, required: true, trim: true, default: "India" },
      state: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      geo: {
        type: { type: String, enum: ["Point"], default: undefined },
        coordinates: { type: [Number], default: undefined },
      },
    },
    priceRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
    },
    availability: [availabilitySchema],
    profilePhoto: { type: String, default: "" },
    workPhotos: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    verificationDocument: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    completedBookings: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

providerProfileSchema.index({ category: 1, "location.city": 1 });
providerProfileSchema.index({ "location.geo": "2dsphere" });

module.exports = mongoose.model("ProviderProfile", providerProfileSchema);
