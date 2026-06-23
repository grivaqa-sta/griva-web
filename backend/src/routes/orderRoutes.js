/**
 * ORDER TRANSACTION ROUTER (orderRoutes.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Maps to checkout services in Spring Boot. Integrates with Method Security checks 
 * to authorize authenticated shoppers and administrators.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Sets up routing rules for checkouts and purchase receipt tracking. Connects 
 * shoppers to cart submitters and allows store staff to update shipment status.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a secure router mapping, checkout requests could execute without valid 
 * customer accounts, losing order tracking integrity.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always enforce authentication checks at the router level for order endpoints. 
 * Order transactions deal with private billing and shipping details that should 
 * never be exposed to public routes.
 */

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { reopenOrder, getNeedsAttention } = require("../controllers/deliveryAttemptController");
const { authenticateJWT, authenticateOptionalJWT, isAdmin, isAdminOrStaff } = require("../middleware/auth");
const { strictLimiter } = require("../middleware/rateLimit");

// ─────────────────────────────────────────────────────────
// Public Routes (No authentication required)
// ─────────────────────────────────────────────────────────

// Maps to: GET /api/orders/track?order_number=GRV-...&phone=+974... (Guest order tracking)
router.get("/track", strictLimiter, orderController.trackGuestOrder);

// ─────────────────────────────────────────────────────────
// Customer Authorized Routes (Requires valid JWT session)
// ─────────────────────────────────────────────────────────

// Maps to: POST /api/orders (Creates new order transaction)
router.post("/", strictLimiter, authenticateOptionalJWT, orderController.createOrder);

// Maps to: PATCH /api/orders/:id/cancel (Customer cancels their pending order)
router.patch("/:id/cancel", authenticateJWT, orderController.cancelMyOrder);

// Maps to: GET /api/orders/my-orders (Fetches past purchase receipts)
router.get("/my-orders", authenticateJWT, orderController.getMyOrders);

// ─────────────────────────────────────────────────────────
// Admin Authorized Routes (Requires valid JWT & Admin status)
// ─────────────────────────────────────────────────────────

// Maps to: GET /api/orders (Fetches all orders, newest first)
router.get("/", authenticateJWT, isAdminOrStaff, orderController.getAllOrders);

// Maps to: GET /api/orders/analytics (Fetches dynamic storefront sales metrics)
router.get("/analytics", authenticateJWT, isAdmin, orderController.getAnalytics);

// FEATURE: Delivery Attempt Management — needs-attention must be before :id routes
router.get("/needs-attention", authenticateJWT, isAdminOrStaff, getNeedsAttention);

// Bulk Print: Mark orders as printed
router.patch("/bulk-print", authenticateJWT, isAdminOrStaff, orderController.bulkPrintOrders);

// Export orders as Excel/CSV
router.get("/export", authenticateJWT, isAdminOrStaff, orderController.exportOrders);

// Maps to: PATCH /api/orders/:id/status (e.g. /api/orders/12/status)
router.patch("/:id/status", authenticateJWT, isAdminOrStaff, orderController.updateOrderStatus);

// Maps to: PATCH /api/orders/:id/review (Mark an order as reviewed/viewed)
router.patch("/:id/review", authenticateJWT, isAdminOrStaff, orderController.reviewOrder);

// ─────────────────────────────────────────────────────────
// FEATURE: Delivery Boy System (Admin / Staff routes)
// ─────────────────────────────────────────────────────────

// Maps to: PATCH /api/orders/:id/assign (Admin assigns a delivery boy)
router.patch("/:id/assign", authenticateJWT, isAdminOrStaff, orderController.assignDeliveryBoy);

// Maps to: GET /api/admin/delivery-boys (Admin fetches all delivery staff)
router.get("/admin/delivery-boys", authenticateJWT, isAdminOrStaff, orderController.getDeliveryBoys);

// Maps to: POST /api/orders/admin/delivery-boys (Admin creates a delivery boy account)
router.post("/admin/delivery-boys", authenticateJWT, isAdmin, orderController.createDeliveryBoy);

// FEATURE: Delivery Attempt Management — admin reopens cancelled/attempted/failed orders
router.patch("/:id/reopen", authenticateJWT, isAdminOrStaff, reopenOrder);

module.exports = router;
