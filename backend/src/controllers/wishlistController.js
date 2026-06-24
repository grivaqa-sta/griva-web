const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

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
          where: { is_active: true } // Only return active products
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add an item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id is required"
      });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ where: { id: product_id, is_active: true } });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive"
      });
    }

    // Find or create to prevent duplicates
    const [wishlistItem, created] = await Wishlist.findOrCreate({
      where: { user_id: userId, product_id: product_id }
    });

    res.status(201).json({
      success: true,
      message: created ? "Added to Wishlist ❤️" : "Already in Wishlist",
      data: wishlistItem
    });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove an item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const deleted = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId }
    });

    res.status(200).json({
      success: true,
      message: deleted ? "Removed from Wishlist" : "Item not found in Wishlist",
      deleted: !!deleted
    });
  } catch (error) {
    console.error("Error in removeFromWishlist:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
