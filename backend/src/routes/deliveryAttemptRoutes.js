// FEATURE: Delivery Attempt Management and Order Reopen System
// File: backend/src/routes/deliveryAttemptRoutes.js
// Do not modify without reading feature documentation

const express = require("express");
const router = express.Router();
const { authenticateDelivery } = require("../middleware/deliveryAuth");
const {
  markAttempted,
  markRescheduled,
  markFailed,
} = require("../controllers/deliveryAttemptController");

router.patch("/orders/:id/attempted", authenticateDelivery, markAttempted);
router.patch("/orders/:id/rescheduled", authenticateDelivery, markRescheduled);
router.patch("/orders/:id/failed", authenticateDelivery, markFailed);

module.exports = router;
