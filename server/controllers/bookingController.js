const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const { sendMail } = require("../config/mailer");
const { notify } = require("../utils/notify");

const createBooking = async (req, res, next) => {
  try {
    const { providerId, serviceDescription, requestedDate, requestedTime } = req.body;

    if (!providerId || !serviceDescription || !requestedDate || !requestedTime) {
      return res.status(400).json({
        message: "providerId, serviceDescription, requestedDate, and requestedTime are required",
      });
    }

    const provider = await ProviderProfile.findById(providerId).populate("userId", "email name");
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const booking = await Booking.create({
      customerId: req.user._id,
      providerId,
      serviceDescription,
      requestedDate,
      requestedTime,
    });

    if (provider.userId?.email) {
      sendMail({
        to: provider.userId.email,
        subject: "New booking request",
        text: `You have a new booking request from ${req.user.name} for ${requestedDate} at ${requestedTime}.`,
      });
    }

    if (provider.userId?._id) {
      notify(provider.userId._id, {
        type: "booking_created",
        message: `New booking request from ${req.user.name} for ${requestedDate} at ${requestedTime}.`,
        link: "/bookings",
      });
    }

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    if (req.user.role === "provider") {
      const provider = await ProviderProfile.findOne({ userId: req.user._id });
      if (!provider) {
        return res.json({ bookings: [] });
      }
      const bookings = await Booking.find({ providerId: provider._id })
        .populate("customerId", "name email phone")
        .populate({ path: "providerId", select: "category location" })
        .sort({ createdAt: -1 });
      return res.json({ bookings });
    }

    const bookings = await Booking.find({ customerId: req.user._id })
      .populate({
        path: "providerId",
        select: "category location userId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["accepted", "rejected", "completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowedStatuses.join(", ")}` });
    }

    const booking = await Booking.findById(req.params.id).populate("customerId", "email name");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const provider = await ProviderProfile.findById(booking.providerId);
    const isOwner = provider && provider.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: not the assigned provider" });
    }

    const wasAlreadyCompleted = booking.status === "completed";
    booking.status = status;
    await booking.save();

    if (status === "completed" && !wasAlreadyCompleted) {
      await ProviderProfile.findByIdAndUpdate(booking.providerId, {
        $inc: { completedBookings: 1 },
      });
    }

    if (booking.customerId?.email) {
      sendMail({
        to: booking.customerId.email,
        subject: `Booking ${status}`,
        text: `Your booking request for ${booking.requestedDate.toDateString()} at ${booking.requestedTime} has been ${status}.`,
      });
    }

    if (booking.customerId?._id) {
      notify(booking.customerId._id, {
        type: "booking_status",
        message: `Your booking for ${booking.requestedDate.toDateString()} at ${booking.requestedTime} was ${status}.`,
        link: "/bookings",
      });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, updateBookingStatus };
