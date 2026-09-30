const express = require("express");
const { upload, useCloudinary } = require("../middleware/upload");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const url = useCloudinary ? req.file.path : `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

module.exports = router;
