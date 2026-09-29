const express = require("express");
const {
  getProviders,
  getProviderById,
  createProviderProfile,
  updateProviderProfile,
  submitVerificationDocument,
} = require("../controllers/providerController");
const { smartSearch } = require("../controllers/smartSearchController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/smart-search", smartSearch);
router.get("/", getProviders);
router.get("/:id", getProviderById);
router.post("/", protect, authorize("provider"), createProviderProfile);
router.put("/:id", protect, authorize("provider", "admin"), updateProviderProfile);
router.post(
  "/:id/verification-document",
  protect,
  authorize("provider"),
  submitVerificationDocument
);

module.exports = router;
