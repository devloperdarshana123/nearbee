const express = require("express");
const {
  createReview,
  getReviewsForProvider,
  reportReview,
  getFlaggedReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("customer"), createReview);
router.get("/provider/:providerId", getReviewsForProvider);
router.post("/:id/report", protect, reportReview);
router.get("/flagged", protect, authorize("admin"), getFlaggedReviews);
router.delete("/:id", protect, authorize("admin"), deleteReview);

module.exports = router;
