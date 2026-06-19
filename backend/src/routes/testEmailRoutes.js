const express = require("express");
const router = express.Router();

const { sendTestEmail } = require("../services/brevoService");

router.get("/", async (req, res) => {
  try {
    await sendTestEmail();

    res.status(200).json({
      success: true,
      message: "Test email sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;