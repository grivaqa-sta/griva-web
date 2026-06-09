/**
 * SUBSCRIBER ROUTER (subscriberRoutes.js)
 */

const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Admin only: list all subscribers
router.get("/", authenticateJWT, isAdmin, subscriberController.getSubscribers);

// Public: register a new subscriber
router.post("/", subscriberController.subscribe);

// Admin only: broadcast simulated newsletters
router.post("/broadcast", authenticateJWT, isAdmin, subscriberController.broadcast);

module.exports = router;
