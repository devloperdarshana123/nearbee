const express = require("express");
const { getMyFavorites, addFavorite, removeFavorite } = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getMyFavorites);
router.post("/", protect, addFavorite);
router.delete("/:providerId", protect, removeFavorite);

module.exports = router;
