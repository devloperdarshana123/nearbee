const express = require("express");
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("customer"), createBooking);
router.get("/my", protect, getMyBookings);
router.put("/:id/status", protect, authorize("provider", "admin"), updateBookingStatus);

module.exports = router;
