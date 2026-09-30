const express = require("express");
const {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute,
} = require("../controllers/disputeController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/", createDispute);
router.get("/my", getMyDisputes);
router.get("/", authorize("admin"), getAllDisputes);
router.put("/:id", authorize("admin"), resolveDispute);

module.exports = router;
