const { ProductPromoBanner, Product } = require("../models");
const cache = require("../utils/cache");

/**
 * Create Banner
 */
exports.createBanner = async (req, res) => {
  try {
    const { productId, title, subtitle, isActive } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingBanner = await ProductPromoBanner.findOne({
      where: { productId },
    });

    if (existingBanner) {
      return res.status(400).json({
        success: false,
        message: "Banner already exists for this product",
      });
    }

    const banner = await ProductPromoBanner.create({
      productId,
      title,
      subtitle,
      isActive,
    });
    cache.clear(); // Clear cache on change

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Banners
 */
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await ProductPromoBanner.findAll({
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Get All Banners Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Active Banners
 */
exports.getActiveBanners = async (req, res) => {
  try {
    const cacheKey = "promo_banners_active";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }

    const banners = await ProductPromoBanner.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    cache.set(cacheKey, banners, 300000); // 5 min cache

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    console.error("Get Active Banners Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Banner By ID
 */
exports.getBannerById = async (req, res) => {
  try {
    const banner = await ProductPromoBanner.findByPk(req.params.id, {
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Get Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Banner
 */
exports.updateBanner = async (req, res) => {
  try {
    const banner = await ProductPromoBanner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.update(req.body);
    cache.clear(); // Clear cache on update

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Banner Status
 */
exports.updateBannerStatus = async (req, res) => {
  try {
    const banner = await ProductPromoBanner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.update({
      isActive: req.body.isActive,
    });
    cache.clear(); // Clear cache on update

    return res.status(200).json({
      success: true,
      message: "Banner status updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update Banner Status Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Banner
 */
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await ProductPromoBanner.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.destroy();
    cache.clear(); // Clear cache on delete

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};