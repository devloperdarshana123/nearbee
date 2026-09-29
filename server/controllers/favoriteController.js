const Favorite = require("../models/Favorite");

const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customerId: req.user._id }).populate({
      path: "providerId",
      populate: { path: "userId", select: "name email phone" },
    });
    res.json({ favorites: favorites.filter((f) => f.providerId).map((f) => f.providerId) });
  } catch (err) {
    next(err);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const { providerId } = req.body;
    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { customerId: req.user._id, providerId },
      { customerId: req.user._id, providerId },
      { upsert: true, new: true }
    );

    res.status(201).json({ favorite });
  } catch (err) {
    next(err);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await Favorite.findOneAndDelete({
      customerId: req.user._id,
      providerId: req.params.providerId,
    });
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyFavorites, addFavorite, removeFavorite };
