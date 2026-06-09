/**
 * SETTING ROUTER (settingRoutes.js)
 */

const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Public route to let frontend load active campaigns
router.get("/", settingController.getSettings);

// Admin restricted route to toggle campaigns
router.patch("/", authenticateJWT, isAdmin, settingController.updateSettings);

module.exports = router;
