const express = require("express");
const { getMe, updateProfile, updateRole, applyReferral, getReferralStats } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/role", protect, updateRole);
router.post("/referral/apply", protect, applyReferral);
router.get("/referral/stats", protect, getReferralStats);

module.exports = router;
