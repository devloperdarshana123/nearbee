const Dispute = require("../models/Dispute");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const { notify } = require("../utils/notify");

const assertParticipant = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).populate("customerId", "name");
  if (!booking) return { error: 404, message: "Booking not found" };

  const isCustomer = booking.customerId._id.toString() === user._id.toString();
  let provider = null;
  let isProvider = false;
  if (!isCustomer) {
    provider = await ProviderProfile.findById(booking.providerId);
    isProvider = !!provider && provider.userId.toString() === user._id.toString();
  } else {
    provider = await ProviderProfile.findById(booking.providerId);
  }

  if (!isCustomer && !isProvider && user.role !== "admin") {
    return { error: 403, message: "Forbidden: not part of this booking" };
  }

  return { booking, provider, isCustomer };
};

const createDispute = async (req, res, next) => {
  try {
    const { bookingId, reason, description } = req.body;
    if (!bookingId || !reason?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "bookingId, reason, and description are required" });
    }

    const { error, message, booking, provider, isCustomer } = await assertParticipant(
      bookingId,
      req.user
    );
    if (error) return res.status(error).json({ message });

    const existing = await Dispute.findOne({ bookingId, status: "open" });
    if (existing) {
      return res.status(409).json({ message: "There's already an open dispute for this booking" });
    }

    const dispute = await Dispute.create({
      bookingId,
      raisedBy: req.user._id,
      reason: reason.trim(),
      description: description.trim(),
    });

    const otherPartyId = isCustomer ? provider?.userId : booking.customerId._id;
    if (otherPartyId) {
      notify(otherPartyId, {
        type: "dispute_raised",
        message: `A dispute was raised on your booking: ${reason.trim()}`,
        link: "/bookings",
      });
    }

    res.status(201).json({ dispute });
  } catch (err) {
    next(err);
  }
};

const getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user._id })
      .populate("bookingId", "serviceDescription requestedDate status")
      .sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (err) {
    next(err);
  }
};

const getAllDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const disputes = await Dispute.find(filter)
      .populate("raisedBy", "name email")
      .populate({
        path: "bookingId",
        select: "serviceDescription requestedDate status customerId providerId",
        populate: [
          { path: "customerId", select: "name email" },
          { path: "providerId", select: "category userId", populate: { path: "userId", select: "name email" } },
        ],
      })
      .sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (err) {
    next(err);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be resolved or rejected" });
    }

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    );
    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    notify(dispute.raisedBy, {
      type: "dispute_status",
      message: `Your dispute was ${status}${adminNote ? `: ${adminNote}` : ""}`,
      link: "/bookings",
    });

    res.json({ dispute });
  } catch (err) {
    next(err);
  }
};

module.exports = { createDispute, getMyDisputes, getAllDisputes, resolveDispute };
