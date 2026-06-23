const express = require("express");
const router = express.Router();
const deliverySlotController = require("../controllers/deliverySlotController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Public route to fetch active delivery slots
router.get("/", deliverySlotController.getDeliverySlots);

// Admin restricted routes
router.post("/", authenticateJWT, isAdmin, deliverySlotController.createDeliverySlot);
router.patch("/:id", authenticateJWT, isAdmin, deliverySlotController.updateDeliverySlot);
router.delete("/:id", authenticateJWT, isAdmin, deliverySlotController.deleteDeliverySlot);

module.exports = router;
