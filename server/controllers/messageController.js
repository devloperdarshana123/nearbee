const Message = require("../models/Message");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");
const { notifyUser } = require("../config/socket");
const { notify } = require("../utils/notify");

const assertParticipant = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId).populate("customerId", "name");
  if (!booking) return { error: 404, message: "Booking not found" };

  const isCustomer = booking.customerId._id.toString() === user._id.toString();
  let isProvider = false;
  if (!isCustomer) {
    const provider = await ProviderProfile.findById(booking.providerId);
    isProvider = !!provider && provider.userId.toString() === user._id.toString();
  }

  if (!isCustomer && !isProvider && user.role !== "admin") {
    return { error: 403, message: "Forbidden: not part of this booking" };
  }

  return { booking };
};

const getMessages = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { error, message, booking } = await assertParticipant(bookingId, req.user);
    if (error) return res.status(error).json({ message });

    const messages = await Message.find({ bookingId }).populate("senderId", "name").sort({ createdAt: 1 });
    res.json({ messages, booking });
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "text is required" });
    }

    const { error, message: errMessage, booking } = await assertParticipant(bookingId, req.user);
    if (error) return res.status(error).json({ message: errMessage });

    const savedMessage = await Message.create({
      bookingId,
      senderId: req.user._id,
      text: text.trim(),
    });
    await savedMessage.populate("senderId", "name");

    const provider = await ProviderProfile.findById(booking.providerId);
    const recipientId = booking.customerId._id.toString() === req.user._id.toString()
      ? provider?.userId
      : booking.customerId._id;

    if (recipientId) {
      notifyUser(recipientId.toString(), "chat:message", { bookingId, message: savedMessage });
      notify(recipientId, {
        type: "chat_message",
        message: `New message from ${req.user.name}`,
        link: "/bookings",
      });
    }

    res.status(201).json({ message: savedMessage });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, sendMessage };
