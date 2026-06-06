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
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────
// Customer Authorized Routes (Requires valid JWT session)
// ─────────────────────────────────────────────────────────

// Maps to: POST /api/orders (Creates new order transaction)
router.post("/", authenticateJWT, orderController.createOrder);

// Maps to: GET /api/orders/my-orders (Fetches past purchase receipts)
router.get("/my-orders", authenticateJWT, orderController.getMyOrders);

// ─────────────────────────────────────────────────────────
// Admin Authorized Routes (Requires valid JWT & Admin status)
// ─────────────────────────────────────────────────────────

// Maps to: PATCH /api/orders/:id/status (e.g. /api/orders/12/status)
router.patch("/:id/status", authenticateJWT, isAdmin, orderController.updateOrderStatus);

module.exports = router;
