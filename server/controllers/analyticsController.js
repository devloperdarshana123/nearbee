const Booking = require("../models/Booking");
const Review = require("../models/Review");
const ProviderProfile = require("../models/ProviderProfile");

const getProviderAnalytics = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({ message: "No provider profile found for this account" });
    }

    const bookings = await Booking.find({ providerId: provider._id });

    const statusCounts = bookings.reduce(
      (acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
      },
      { pending: 0, accepted: 0, rejected: 0, completed: 0 }
    );

    const estimatedEarnings = bookings.filter((b) => b.status === "completed").length * provider.priceRange.min;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyBuckets = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(sixMonthsAgo);
      d.setMonth(d.getMonth() + i);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("default", { month: "short" }), bookings: 0 };
    });

    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = monthlyBuckets.find((m) => m.key === key);
      if (bucket) bucket.bookings += 1;
    });

    const recentReviews = await Review.find({ providerId: provider._id })
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBookings: bookings.length,
      statusCounts,
      completedBookings: statusCounts.completed,
      estimatedEarnings,
      avgRating: provider.avgRating,
      reviewCount: provider.reviewCount,
      isVerified: provider.isVerified,
      monthlyBookings: monthlyBuckets.map(({ label, bookings: count }) => ({ label, bookings: count })),
      recentReviews,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProviderAnalytics };
