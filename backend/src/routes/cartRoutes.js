const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticateJWT } = require("../middleware/auth");

// Secure all endpoints below with JWT verification middleware
router.use(authenticateJWT);

// GET /api/cart - Fetch current authenticated user's cart
router.get("/", cartController.getCart);

// DELETE /api/cart - Clear all items in user's cart
router.delete("/", cartController.clearCart);

// POST /api/cart/items - Add a new item (or increment quantity) in cart
router.post("/items", cartController.addItem);

// PATCH /api/cart/items/:id - Update cart item quantity
router.patch("/items/:id", cartController.updateItemQty);

// DELETE /api/cart/items/:id - Remove item from cart
router.delete("/items/:id", cartController.removeItem);

// POST /api/cart/merge - Merge local storage guest items into database cart on login
router.post("/merge", cartController.mergeCart);

module.exports = router;
