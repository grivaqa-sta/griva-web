const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");
const handleApiError = require("../utils/errorHandler");

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId || isNaN(Number(productId))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.getReviewsByProduct");
  }
};

exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, title, body } = req.body;
    const userId = req.user.id;

    if (!product_id || isNaN(Number(product_id)) || !rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || !body || typeof body !== "string" || !body.trim()) {
      const err = new Error("Missing required review fields or invalid rating (must be 1-5).");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      const err = new Error("Product not found.");
      err.statusCode = 404;
      throw err;
    }

    const review = await Review.create({
      product_id,
      user_id: userId,
      rating: Number(rating),
      title: title ? title.trim() : null,
      body: body.trim(),
      verified: true,
    });

    const reviews = await Review.findAll({ where: { product_id } });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = (totalRating / reviews.length).toFixed(2);
    product.review_count = reviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.createReview");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid review ID");
      err.statusCode = 400;
      throw err;
    }

    const review = await Review.findByPk(id);
    if (!review) {
      const err = new Error("Review not found.");
      err.statusCode = 404;
      throw err;
    }

    if (req.user.role !== "admin" && review.user_id !== req.user.id) {
      const err = new Error("Access Forbidden. You are not authorized to delete this review.");
      err.statusCode = 403;
      throw err;
    }

    const productId = review.product_id;
    await review.destroy();

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

    res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.deleteReview");
  }
};

exports.getOrderByNumberForReview = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    if (!orderNumber || typeof orderNumber !== "string" || !orderNumber.trim()) {
      const err = new Error("Order number is required");
      err.statusCode = 400;
      throw err;
    }

    const Order = require("../models/Order");
    const OrderItem = require("../models/OrderItem");

    const order = await Order.findOne({
      where: { order_number: orderNumber.trim() },
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
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    const isDeliverableStatus = ["delivered", "completed"].includes(order.status);
    if (!isDeliverableStatus) {
      const err = new Error(`Order must be delivered before you can submit a review. Current status: ${order.status}`);
      err.statusCode = 400;
      throw err;
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.getOrderByNumberForReview");
  }
};

exports.createOrderReviews = async (req, res) => {
  const { sequelize } = require("../config/db");
  let transaction;
  try {
    const { order_number, delivery_rating, delivery_comment, product_reviews } = req.body;

    if (!order_number || typeof order_number !== "string" || !order_number.trim()) {
      const err = new Error("Order number is required.");
      err.statusCode = 400;
      throw err;
    }

    const Order = require("../models/Order");
    const order = await Order.findOne({ where: { order_number: order_number.trim() } });
    if (!order) {
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    const isDeliverableStatus = ["delivered", "completed"].includes(order.status);
    if (!isDeliverableStatus) {
      const err = new Error("Only delivered or completed orders can be reviewed.");
      err.statusCode = 400;
      throw err;
    }

    transaction = await sequelize.transaction();

    if (delivery_rating !== undefined) {
      order.delivery_rating = parseInt(delivery_rating, 10);
      order.delivery_comment = delivery_comment || null;
      await order.save({ transaction });
    }

    if (product_reviews && Array.isArray(product_reviews)) {
      let reviewUserId = order.user_id;
      if (!reviewUserId) {
        const existingUser = await User.findOne({ 
          where: { email: order.customer_email },
          transaction 
        });
        if (existingUser) {
          reviewUserId = existingUser.id;
        } else {
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

        await Review.create({
          product_id,
          user_id: reviewUserId,
          rating: parseInt(rating, 10),
          title: null,
          body,
          verified: true
        }, { transaction });

        const reviews = await Review.findAll({ 
          where: { product_id },
          transaction 
        });
        const allRatings = reviews.map(r => r.rating);
        allRatings.push(parseInt(rating, 10));
        const avg = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
        
        product.rating = parseFloat(avg.toFixed(2));
        product.review_count = allRatings.length;
        await product.save({ transaction });
      }
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: "Reviews submitted successfully." });
  } catch (error) {
    if (transaction) await transaction.rollback();
    return handleApiError(error, req, res, "ReviewController.createOrderReviews");
  }
};

exports.getDeliveryReviews = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      const err = new Error("Access Forbidden. Only administrators can view delivery feedback.");
      err.statusCode = 403;
      throw err;
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

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.getDeliveryReviews");
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "staff") {
      const err = new Error("Access Forbidden. Only administrators can view product reviews.");
      err.statusCode = 403;
      throw err;
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

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    return handleApiError(error, req, res, "ReviewController.getAllReviews");
  }
};
