const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { authenticateJWT } = require("../middleware/auth");

// Authentication required — prevents unauthenticated bots from spamming Cloudinary uploads
router.post("/image", authenticateJWT, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("❌ [IMAGE UPLOAD ERROR]:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload image to Cloudinary",
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  });
});

module.exports = router;