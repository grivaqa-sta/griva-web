const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

exports.getReviewsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { product_id, rating, title, body } = req.body;
    const userId = req.user.id; // Populated by JWT authentication middleware

    if (!product_id || !rating || !body) {
      return res.status(400).json({ error: "Missing required review fields." });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const review = await Review.create({
      product_id,
      user_id: userId,
      rating,
      title,
      body,
      verified: true, // Default to true since user is logged in (could verify with orders later)
    });

    // Update product rating and review count
    const reviews = await Review.findAll({ where: { product_id } });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = (totalRating / reviews.length).toFixed(2);
    product.review_count = reviews.length;
    await product.save();

    res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Only allow admin or the author to delete reviews
    if (req.user.role !== "admin" && review.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. You are not authorized to delete this review." });
    }

    const productId = review.product_id;
    await review.destroy();

    // Recalculate ratings
    const product = await Product.findByPk(productId);
    if (product) {
      const reviews = await Review.findAll({ where: { product_id: productId } });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = (totalRating / reviews.length).toFixed(2);
        product.review_count = reviews.length;
      } else {
        product.rating = 0.00;
        product.review_count = 0;
      }
      await product.save();
    }

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};
