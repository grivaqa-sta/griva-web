const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const { Op } = require("sequelize");

/**
 * Helper to extract Cloudinary public ID from its URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;
    const pathAfterUpload = splitUrl[1];
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

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

    // CRIT-4: Enforce is_active check for public views (allow admin/staff to see deactivated ones)
    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");
    if (!isAdminOrStaffUser) {
      where.is_active = true;
    }

    if (search) {
      // MED-11: Escape SQL wildcard characters % and _ in search query
      const escapedSearch = search.replace(/[%_]/g, "\\$&");
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${escapedSearch}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${escapedSearch}%`,
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

    // CRIT-4: Add is_active check for public views on product details
    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");
    if (!product || (!product.is_active && !isAdminOrStaffUser)) {
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
    const where = {
      subcategory_id: req.params.subcategoryId,
    };

    // CRIT-4: Enforce is_active check for public subcategory view
    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");
    if (!isAdminOrStaffUser) {
      where.is_active = true;
    }

    const products = await Product.findAll({
      where,
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

    // If main_image_url is being updated, delete the old one from Cloudinary to free space
    if (req.body.main_image_url && product.main_image_url && req.body.main_image_url !== product.main_image_url) {
      const oldPublicId = getPublicIdFromUrl(product.main_image_url);
      if (oldPublicId) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(oldPublicId).catch(err => {
          console.error("Failed to delete old image from Cloudinary:", err);
        });
      }
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

    // Delete image from Cloudinary if it exists
    if (product.main_image_url) {
      const publicId = getPublicIdFromUrl(product.main_image_url);
      if (publicId) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(publicId).catch(err => {
          console.error("Failed to delete product image from Cloudinary:", err);
        });
      }
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

//banner update api

exports.updateBannerStatus = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { is_banner, href, tags,banner_background_color,mobile_ad_banner} = req.body;

    await product.update({
      is_banner,
      href,
      tags,
      banner_background_color,
      mobile_ad_banner
    });

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get isbanner active product
exports.getBannerActiveProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        is_banner: true,
        is_active: true,
      },
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

//deal of the day
exports.updateDealOfDay = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { deal_of_day} = req.body;

    await product.update({
      deal_of_day
    });

    res.status(200).json({
      success: true,
      message: "deal of the day updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get deal of the day products
exports.getDealOfDayProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        deal_of_day: true,
        is_active: true,
      },
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

