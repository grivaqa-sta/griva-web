const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const { Op } = require("sequelize");

/**
 * Create Product
 */
exports.createProduct = async (req, res) => {
  try {
    const { subcategory_id, title, price, main_image_url } = req.body;

    if (!subcategory_id || !title || !price || !main_image_url) {
      return res.status(400).json({
        success: false,
        message:
          "subcategory_id, title, price and main_image_url are required",
      });
    }

    const subCategory = await SubCategory.findByPk(subcategory_id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Products
 */
exports.getProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price[Op.gte] = Number(minPrice);
      }

      if (maxPrice) {
        where.price[Op.lte] = Number(maxPrice);
      }
    }

    const products = await Product.findAll({
      where,
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Product By ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Products By SubCategory
 */
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        subcategory_id: req.params.subcategoryId,
      },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Featured Products
 */
exports.getFeaturedProducts = async (req, res) => {
  const products = await Product.findAll({
    where: {
      is_featured: true,
      is_active: true,
    },
  });

  res.status(200).json({
    success: true,
    data: products,
  });
};

/**
 * Trending Products
 */
exports.getTrendingProducts = async (req, res) => {
  const products = await Product.findAll({
    where: {
      is_trending: true,
      is_active: true,
    },
  });

  res.status(200).json({
    success: true,
    data: products,
  });
};

/**
 * Best Seller Products
 */
exports.getBestSellerProducts = async (req, res) => {
  const products = await Product.findAll({
    where: {
      is_best_seller: true,
      is_active: true,
    },
  });

  res.status(200).json({
    success: true,
    data: products,
  });
};

/**
 * New Arrival Products
 */
exports.getNewProducts = async (req, res) => {
  const products = await Product.findAll({
    where: {
      is_new: true,
      is_active: true,
    },
  });

  res.status(200).json({
    success: true,
    data: products,
  });
};

/**
 * Update Product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.update(req.body);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Stock
 */
exports.updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stock = stock;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      stock: product.stock,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};