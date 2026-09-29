const express = require("express");
const { getProviderAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/provider", protect, authorize("provider"), getProviderAnalytics);

module.exports = router;
