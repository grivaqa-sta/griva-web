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

exports.getOrderByNumberForReview = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const Order = require("../models/Order");
    const OrderItem = require("../models/OrderItem");
    const User = require("../models/User");

    const order = await Order.findOne({
      where: { order_number: orderNumber },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url"],
          },
        },
        {
          model: User,
          as: "deliveryBoy",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Only allow reviews for delivered or completed orders
    const isDeliverableStatus = ["delivered", "completed"].includes(order.status);
    if (!isDeliverableStatus) {
      return res.status(400).json({ 
        error: `Order must be delivered before you can submit a review. Current status: ${order.status}` 
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    next(error);
  }
};

exports.createOrderReviews = async (req, res, next) => {
  const { sequelize } = require("../config/db");
  let transaction;
  try {
    const { order_number, delivery_rating, delivery_comment, product_reviews } = req.body;

    if (!order_number) {
      return res.status(400).json({ error: "Order number is required." });
    }

    const Order = require("../models/Order");
    const order = await Order.findOne({ where: { order_number } });
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const isDeliverableStatus = ["delivered", "completed"].includes(order.status);
    if (!isDeliverableStatus) {
      return res.status(400).json({ error: "Only delivered or completed orders can be reviewed." });
    }

    transaction = await sequelize.transaction();

    // 1. Save Delivery Review on Order
    if (delivery_rating !== undefined) {
      order.delivery_rating = parseInt(delivery_rating, 10);
      order.delivery_comment = delivery_comment || null;
      await order.save({ transaction });
    }

    // 2. Save Product Reviews
    if (product_reviews && Array.isArray(product_reviews)) {
      // Find or resolve a valid user_id for the database constraint
      let reviewUserId = order.user_id;
      if (!reviewUserId) {
        const existingUser = await User.findOne({ 
          where: { email: order.customer_email },
          transaction 
        });
        if (existingUser) {
          reviewUserId = existingUser.id;
        } else {
          // Find or create a default "Guest Reviewer" account to satisfy foreign key constraint
          const [guestUser] = await User.findOrCreate({
            where: { email: "guest.reviewer@thegriva.com" },
            defaults: {
              name: "Guest Reviewer",
              password: "placeholder-never-used-hash-griva",
              role: "user",
              status: "ACTIVE"
            },
            transaction
          });
          reviewUserId = guestUser.id;
        }
      }

      for (const pr of product_reviews) {
        const { product_id, rating, body } = pr;
        if (!product_id || !rating || !body) continue;

        const product = await Product.findByPk(product_id, {
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        if (!product) continue;

        // Create Review entry
        await Review.create({
          product_id,
          user_id: reviewUserId,
          rating: parseInt(rating, 10),
          title: null,
          body,
          verified: true
        }, { transaction });

        // Update product rating and review count
        const reviews = await Review.findAll({ 
          where: { product_id },
          transaction 
        });
        const allRatings = reviews.map(r => r.rating);
        // Include the new one we just added if it's not retrieved yet
        allRatings.push(parseInt(rating, 10));
        const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
        
        product.rating = parseFloat(avg.toFixed(2));
        product.review_count = allRatings.length;
        await product.save({ transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ message: "Reviews submitted successfully." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

exports.getDeliveryReviews = async (req, res, next) => {
  try {
    // Only allow admin or staff
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ error: "Access Forbidden. Only administrators can view delivery feedback." });
    }

    const Order = require("../models/Order");
    const { Op } = require("sequelize");
    const reviews = await Order.findAll({
      where: {
        delivery_rating: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: User,
          as: "deliveryBoy",
          attributes: ["id", "name", "email"],
        }
      ],
      order: [["updatedAt", "DESC"]]
    });

    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};

exports.getAllReviews = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      return res.status(403).json({ error: "Access Forbidden. Only administrators can view product reviews." });
    }

    const reviews = await Review.findAll({
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "main_image_url"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ reviews });
  } catch (error) {
    next(error);
  }
};
