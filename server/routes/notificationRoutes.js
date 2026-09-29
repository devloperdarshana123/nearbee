const express = require("express");
const { getMyNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", getMyNotifications);
router.put("/read", markAsRead);

module.exports = router;
