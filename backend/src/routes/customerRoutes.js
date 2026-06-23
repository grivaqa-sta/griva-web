const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticateJWT, isAdminOrStaff } = require("../middleware/auth");

// Secure all customer directory endpoints under admin / staff authentication check
router.use(authenticateJWT);
router.use(isAdminOrStaff);

router.get("/", customerController.getCustomers);
router.get("/analytics", customerController.getCustomerAnalytics);
router.get("/export", customerController.exportCustomers);
router.get("/:id", customerController.getCustomerById);
router.get("/:id/orders", customerController.getCustomerOrders);
router.patch("/:id/status", customerController.updateCustomerStatus);

module.exports = router;
