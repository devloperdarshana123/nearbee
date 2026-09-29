const express = require("express");
const {
  getUsers,
  setProviderVerification,
  banUser,
  getAllBookings,
  getPendingVerifications,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.put("/users/:id/ban", banUser);
router.put("/providers/:id/verify", setProviderVerification);
router.get("/bookings", getAllBookings);
router.get("/verifications", getPendingVerifications);

module.exports = router;
