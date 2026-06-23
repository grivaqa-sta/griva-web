const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const notificationController = require("../controllers/notificationController");
const { authenticateDelivery } = require("../middleware/deliveryAuth");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// GET  /api/delivery/my-orders  — Today's assigned orders
router.get("/my-orders", authenticateDelivery, deliveryController.getMyOrders);

// PATCH /api/delivery/orders/:id/status  — Update order status (assigned → out_for_delivery → delivered)
router.patch("/orders/:id/status", authenticateDelivery, deliveryController.updateMyOrderStatus);

// GET  /api/delivery/history  — Last 7 days completed deliveries
router.get("/history", authenticateDelivery, deliveryController.getMyDeliveryHistory);

// ─────────────────────────────────────────────────────────
// DRIVER NOTIFICATIONS
// ─────────────────────────────────────────────────────────

// POST  /api/delivery/admin/notifications  — Admin broadcasts or sends direct message
router.post("/admin/notifications", authenticateJWT, isAdmin, notificationController.sendNotification);

// GET  /api/delivery/notifications  — Fetch driver notifications
router.get("/notifications", authenticateDelivery, notificationController.getMyNotifications);

// PATCH /api/delivery/notifications/:id/read  — Mark notification as read
router.patch("/notifications/:id/read", authenticateDelivery, notificationController.markAsRead);

// DELETE /api/delivery/notifications/clear-all  — Clear driver notifications
router.delete("/notifications/clear-all", authenticateDelivery, notificationController.clearNotifications);

// DELETE /api/delivery/notifications/:id  — Delete single notification
router.delete("/notifications/:id", authenticateDelivery, notificationController.deleteNotification);

module.exports = router;
