const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const notificationController = require("../controllers/notificationController");
const { authenticateDelivery } = require("../middleware/deliveryAuth");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// GET  /api/delivery/my-orders  — Today's assigned orders
router.get("/my-orders", authenticateDelivery, deliveryController.getMyOrders);

// GET  /api/delivery/orders/:id  — Specific order details
router.get("/orders/:id", authenticateDelivery, deliveryController.getOrderDetails);

// PATCH /api/delivery/orders/:id/status  — Update order status (assigned → out_for_delivery → delivered)
router.patch("/orders/:id/status", authenticateDelivery, deliveryController.updateMyOrderStatus);

// GET  /api/delivery/history  — Last 7 days completed deliveries
router.get("/history", authenticateDelivery, deliveryController.getMyDeliveryHistory);

// GET  /api/delivery/my-returns  — Assigned return/pickup tasks
router.get("/my-returns", authenticateDelivery, deliveryController.getMyReturns);

// PATCH /api/delivery/returns/:id/status  — Update return task status (completed_replacement or completed_refund)
router.patch("/returns/:id/status", authenticateDelivery, deliveryController.updateReturnStatus);

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
