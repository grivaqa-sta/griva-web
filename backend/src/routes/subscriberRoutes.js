/**
 * SUBSCRIBER ROUTER (subscriberRoutes.js)
 */

const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");
const { authenticateJWT, isAdminOrStaff } = require("../middleware/auth");

// Admin / Staff: list all subscribers
router.get("/", authenticateJWT, isAdminOrStaff, subscriberController.getSubscribers);

// Public: register a new subscriber
router.post("/", subscriberController.subscribe);

// Admin / Staff: broadcast simulated newsletters
router.post("/broadcast", authenticateJWT, isAdminOrStaff, subscriberController.broadcast);

module.exports = router;
