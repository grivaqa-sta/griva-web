const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Secure all customer directory endpoints under admin authentication check
router.use(authenticateJWT);
router.use(isAdmin);

router.get("/", customerController.getCustomers);
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/:id", customerController.getCustomerById);
router.get("/:id/orders", customerController.getCustomerOrders);
router.patch("/:id/status", customerController.updateCustomerStatus);

module.exports = router;
