const User = require("../models/User");
const ProviderProfile = require("../models/ProviderProfile");
const Booking = require("../models/Booking");
const { notify } = require("../utils/notify");

const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const setProviderVerification = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }

    const provider = await ProviderProfile.findByIdAndUpdate(
      req.params.id,
      { isVerified, verificationStatus: isVerified ? "approved" : "rejected" },
      { new: true }
    ).populate("userId", "name email");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.userId?._id) {
      notify(provider.userId._id, {
        type: "verification_status",
        message: isVerified
          ? "Your provider profile has been verified! You'll now show the verified badge."
          : "Your verification request was not approved. You can resubmit your document anytime.",
        link: "/provider/dashboard",
      });
    }

    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("customerId", "name email")
      .populate({
        path: "providerId",
        select: "category location userId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const getPendingVerifications = async (req, res, next) => {
  try {
    const providers = await ProviderProfile.find({ verificationStatus: "pending" })
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });
    res.json({ providers });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  setProviderVerification,
  banUser,
  getAllBookings,
  getPendingVerifications,
};
