const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const handleApiError = require("../utils/errorHandler");

// Get all wishlist items for the authenticated user
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = await Wishlist.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: "product",
          where: { is_active: true }
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    return handleApiError(error, req, res, "WishlistController.getWishlist");
  }
};

// Add an item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id || isNaN(Number(product_id))) {
      const err = new Error("Valid product_id is required");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findOne({ where: { id: product_id, is_active: true } });
    if (!product) {
      const err = new Error("Product not found or inactive");
      err.statusCode = 404;
      throw err;
    }

    const [wishlistItem, created] = await Wishlist.findOrCreate({
      where: { user_id: userId, product_id: product_id }
    });

    res.status(201).json({
      success: true,
      message: created ? "Added to Wishlist ❤️" : "Already in Wishlist",
      data: wishlistItem
    });
  } catch (error) {
    return handleApiError(error, req, res, "WishlistController.addToWishlist");
  }
};

// Remove an item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId || isNaN(Number(productId))) {
      const err = new Error("Valid productId is required");
      err.statusCode = 400;
      throw err;
    }

    const deleted = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId }
    });

    res.status(200).json({
      success: true,
      message: deleted ? "Removed from Wishlist" : "Item not found in Wishlist",
      deleted: !!deleted
    });
  } catch (error) {
    return handleApiError(error, req, res, "WishlistController.removeFromWishlist");
  }
};
