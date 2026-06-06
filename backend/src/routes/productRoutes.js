/**
 * PRODUCT CATALOG ROUTER (productRoutes.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to mapping Spring Boot endpoints using `@RestController` path mappings.
 * Admin permissions checking matches method-level security checking in Spring:
 * `@PreAuthorize("hasRole('ADMIN')")`.
 * In Express, we handle this by appending multiple middleware functions sequentially 
 * in the route arguments: `router.post("/", authenticateJWT, isAdmin, controller.create)`.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Sets up routing rules for product inventories and classifications. Restricts database 
 * mutating operations (creating products or adjusting stock) exclusively to authorized Admins.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without routing permissions checks, non-admin shoppers could bypass authentication 
 * filters and delete or modify products at will.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Put public routes (like listing products) before dynamic path parameters (like `/:id`). 
 * Otherwise, the router will mistake the word "categories" as a product ID parameter 
 * and throw a database integer casting error!
 */

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// ─────────────────────────────────────────────────────────
// Public Catalog Routes (Accessible to all shoppers)
// ─────────────────────────────────────────────────────────

// Maps to: GET /api/products
router.get("/", productController.getProducts);

// Maps to: GET /api/products/categories
// Note: Placed BEFORE /:id so Express parses "categories" as a route, not an ID string parameter!
router.get("/categories", productController.getCategories);

// Maps to: GET /api/products/:id (e.g. /api/products/12)
router.get("/:id", productController.getProductById);

// ─────────────────────────────────────────────────────────
// Admin Authorized Routes (Requires valid JWT & Admin role status)
// ─────────────────────────────────────────────────────────

// Maps to: POST /api/products
router.post("/", authenticateJWT, isAdmin, productController.createProduct);

// Maps to: PATCH /api/products/:id/stock (e.g. /api/products/12/stock)
router.patch("/:id/stock", authenticateJWT, isAdmin, productController.updateProductStock);

module.exports = router;
