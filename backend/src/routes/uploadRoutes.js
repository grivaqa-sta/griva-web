const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/image", upload.single("image"), (req, res) => {
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