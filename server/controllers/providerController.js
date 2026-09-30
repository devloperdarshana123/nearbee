const ProviderProfile = require("../models/ProviderProfile");
const Booking = require("../models/Booking");
const { buildProviderFilter } = require("../utils/providerFilters");

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const getProviders = async (req, res, next) => {
  try {
    const filter = buildProviderFilter(req.query);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const near = req.query.near ? String(req.query.near).split(",").map(Number) : null;
    const hasNear = near && near.length === 2 && near.every((n) => Number.isFinite(n));

    if (hasNear) {
      const [lat, lng] = near;
      filter["location.geo"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 50000,
        },
      };
    }

    const query = ProviderProfile.find(filter).populate("userId", "name email phone");
    if (!hasNear) query.sort({ avgRating: -1, createdAt: -1 });

    const [providers, total] = await Promise.all([
      query.skip(skip).limit(limit),
      ProviderProfile.countDocuments(filter),
    ]);

    res.json({ providers, page, totalPages: Math.max(1, Math.ceil(total / limit)), total });
  } catch (err) {
    next(err);
  }
};

const getProviderById = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

const createProviderProfile = async (req, res, next) => {
  try {
    const existing = await ProviderProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Provider profile already exists for this user" });
    }

    const { category, bio, location, priceRange, availability, profilePhoto, workPhotos } =
      req.body;

    if (
      !category ||
      !location?.city ||
      !location?.area ||
      !location?.state ||
      !location?.country ||
      priceRange?.min == null ||
      priceRange?.max == null
    ) {
      return res.status(400).json({
        message:
          "category, location.country, location.state, location.city, location.area, and priceRange.min/max are required",
      });
    }

    const finalLocation = { ...location };
    if (location?.lat != null && location?.lng != null) {
      finalLocation.geo = { type: "Point", coordinates: [Number(location.lng), Number(location.lat)] };
    }
    delete finalLocation.lat;
    delete finalLocation.lng;

    const provider = await ProviderProfile.create({
      userId: req.user._id,
      category,
      bio,
      location: finalLocation,
      priceRange,
      availability,
      profilePhoto,
      workPhotos,
    });

    res.status(201).json({ provider });
  } catch (err) {
    next(err);
  }
};

const updateProviderProfile = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const isOwner = provider.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: not the profile owner" });
    }

    const allowedFields = [
      "category",
      "bio",
      "location",
      "priceRange",
      "availability",
      "profilePhoto",
      "workPhotos",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] === undefined) return;
      if (field === "location") {
        const loc = { ...req.body.location };
        if (loc.lat != null && loc.lng != null) {
          loc.geo = { type: "Point", coordinates: [Number(loc.lng), Number(loc.lat)] };
        }
        delete loc.lat;
        delete loc.lng;
        provider.location = loc;
        return;
      }
      provider[field] = req.body[field];
    });

    await provider.save();
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

const submitVerificationDocument = async (req, res, next) => {
  try {
    const { documentUrl } = req.body;
    if (!documentUrl) {
      return res.status(400).json({ message: "documentUrl is required" });
    }

    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    if (provider.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: not the profile owner" });
    }

    provider.verificationDocument = documentUrl;
    provider.verificationStatus = "pending";
    await provider.save();

    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date query param is required (YYYY-MM-DD)" });
    }

    const provider = await ProviderProfile.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (!provider.availability?.length) {
      return res.json({ slots: [], hasScheduledAvailability: false });
    }

    const dayName = DAY_NAMES[new Date(`${date}T00:00:00`).getDay()];
    const windows = provider.availability.filter((a) => a.day === dayName);

    const slotSet = new Set();
    windows.forEach(({ startTime, endTime }) => {
      let mins = timeToMinutes(startTime);
      const end = timeToMinutes(endTime);
      while (mins + 60 <= end) {
        slotSet.add(minutesToTime(mins));
        mins += 60;
      }
    });

    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    const existingBookings = await Booking.find({
      providerId: provider._id,
      requestedDate: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ["pending", "accepted", "completed"] },
    });
    const takenTimes = new Set(existingBookings.map((b) => b.requestedTime));

    const slots = Array.from(slotSet)
      .sort()
      .map((time) => ({ time, available: !takenTimes.has(time) }));

    res.json({ slots, hasScheduledAvailability: true });
  } catch (err) {
    next(err);
  }
};

const getPriceEstimate = async (req, res, next) => {
  try {
    const { category, city } = req.query;
    if (!category) {
      return res.status(400).json({ message: "category query param is required" });
    }

    const cityMatch = city
      ? await ProviderProfile.aggregate([
          { $match: { category, "location.city": new RegExp(`^${city}$`, "i") } },
          {
            $group: {
              _id: null,
              avgMin: { $avg: "$priceRange.min" },
              avgMax: { $avg: "$priceRange.max" },
              count: { $sum: 1 },
            },
          },
        ])
      : [];

    let scope = "city";
    let stats = cityMatch[0];

    if (!stats || stats.count < 2) {
      const categoryMatch = await ProviderProfile.aggregate([
        { $match: { category } },
        {
          $group: {
            _id: null,
            avgMin: { $avg: "$priceRange.min" },
            avgMax: { $avg: "$priceRange.max" },
            count: { $sum: 1 },
          },
        },
      ]);
      stats = categoryMatch[0];
      scope = "category";
    }

    if (!stats) {
      return res.json({ min: null, max: null, count: 0, scope: "none" });
    }

    res.json({
      min: Math.round(stats.avgMin * 0.85),
      max: Math.round(stats.avgMax * 1.15),
      count: stats.count,
      scope,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile,
  submitVerificationDocument,
  getAvailableSlots,
  getPriceEstimate,
};
