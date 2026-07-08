const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authenticateJWT } = require("../middleware/auth");

// Secure all wishlist routes under JWT authentication
router.use(authenticateJWT);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addToWishlist);
router.delete("/:productId", wishlistController.removeFromWishlist);

module.exports = router;
