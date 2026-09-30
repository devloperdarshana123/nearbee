const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["open", "resolved", "rejected"],
      default: "open",
    },
    adminNote: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Dispute", disputeSchema);
