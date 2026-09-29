const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ProviderProfile = require("../models/ProviderProfile");

const recalculateAvgRating = async (providerId) => {
  const stats = await Review.aggregate([
    { $match: { providerId } },
    { $group: { _id: "$providerId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);
  const avgRating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length ? stats[0].reviewCount : 0;
  await ProviderProfile.findByIdAndUpdate(providerId, { avgRating, reviewCount });
};

const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, photos } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "bookingId and rating are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: not your booking" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Booking must be completed before reviewing" });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(409).json({ message: "This booking has already been reviewed" });
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating,
      comment,
      photos: Array.isArray(photos) ? photos.slice(0, 5) : [],
    });

    await recalculateAvgRating(booking.providerId);

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

const getReviewsForProvider = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

const reportReview = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true, flagReason: reason || "Reported by a user" },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ review });
  } catch (err) {
    next(err);
  }
};

const getFlaggedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isFlagged: true })
      .populate("customerId", "name email")
      .populate({ path: "providerId", select: "category userId", populate: { path: "userId", select: "name" } })
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    await recalculateAvgRating(review.providerId);
    res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getReviewsForProvider,
  reportReview,
  getFlaggedReviews,
  deleteReview,
};
