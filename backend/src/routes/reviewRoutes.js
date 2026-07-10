const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticateJWT } = require("../middleware/auth");

router.get("/product/:productId", reviewController.getReviewsByProduct);
router.post("/", authenticateJWT, reviewController.createReview);
router.delete("/:id", authenticateJWT, reviewController.deleteReview);

// Public Order Review system
router.get("/order/:orderNumber", reviewController.getOrderByNumberForReview);
router.post("/order", reviewController.createOrderReviews);

// Admin-only Delivery & Product Reviews
router.get("/", authenticateJWT, reviewController.getAllReviews);
router.get("/delivery", authenticateJWT, reviewController.getDeliveryReviews);

module.exports = router;
