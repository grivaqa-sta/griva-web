const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { authenticateJWT } = require("../middleware/auth");

// Authentication required — prevents unauthenticated bots from spamming Cloudinary uploads
router.post("/image", authenticateJWT, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No image uploaded" });
  }

  res.status(200).json({
    success: true,
    imageUrl: req.file.path,
    publicId: req.file.filename,
  });
});

module.exports = router;