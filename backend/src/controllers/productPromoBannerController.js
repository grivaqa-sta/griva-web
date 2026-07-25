const { ProductPromoBanner, Product } = require("../models");
const cache = require("../utils/cache");
const handleApiError = require("../utils/errorHandler");

/**
 * Create Banner
 */
exports.createBanner = async (req, res) => {
  try {
    const { productId, title, subtitle, isActive } = req.body;

    if (!productId || isNaN(Number(productId))) {
      const err = new Error("Valid productId is required");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    const existingBanner = await ProductPromoBanner.findOne({
      where: { productId },
    });

    if (existingBanner) {
      const err = new Error("Banner already exists for this product");
      err.statusCode = 409;
      throw err;
    }

    const banner = await ProductPromoBanner.create({
      productId,
      title,
      subtitle,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    cache.clear();

    return res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.createBanner");
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
    return handleApiError(error, req, res, "ProductPromoBannerController.getAllBanners");
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

    cache.set(cacheKey, banners, 300000);

    return res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.getActiveBanners");
  }
};

/**
 * Get Banner By ID
 */
exports.getBannerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await ProductPromoBanner.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.getBannerById");
  }
};

/**
 * Update Banner
 */
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await ProductPromoBanner.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.update(req.body);
    cache.clear();

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.updateBanner");
  }
};

/**
 * Update Banner Status
 */
exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await ProductPromoBanner.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.update({
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : banner.isActive,
    });
    cache.clear();

    return res.status(200).json({
      success: true,
      message: "Banner status updated successfully",
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.updateBannerStatus");
  }
};

/**
 * Delete Banner
 */
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await ProductPromoBanner.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.destroy();
    cache.clear();

    return res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductPromoBannerController.deleteBanner");
  }
};