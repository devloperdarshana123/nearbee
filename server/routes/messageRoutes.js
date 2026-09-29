const express = require("express");
const { getMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/:bookingId", getMessages);
router.post("/:bookingId", sendMessage);

module.exports = router;
