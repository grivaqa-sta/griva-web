const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticateJWT } = require("../middleware/auth");

router.get("/product/:productId", reviewController.getReviewsByProduct);
router.post("/", authenticateJWT, reviewController.createReview);
router.delete("/:id", authenticateJWT, reviewController.deleteReview);

module.exports = router;
