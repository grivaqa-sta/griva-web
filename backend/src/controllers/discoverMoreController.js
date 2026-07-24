const DiscoverMore = require("../models/DiscoverMore");
const Category = require("../models/Category");
const handleApiError = require("../utils/errorHandler");

/**
 * Create Discover More Banner
 */
exports.createDiscoverMore = async (req, res) => {
  try {
    const {
      categoryId,
      subtitle,
      title,
      image_url,
      href,
      is_active,
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      const err = new Error("Title is required");
      err.statusCode = 400;
      throw err;
    }

    if (categoryId) {
      if (isNaN(Number(categoryId))) {
        const err = new Error("Invalid category ID");
        err.statusCode = 400;
        throw err;
      }
      const category = await Category.findByPk(categoryId);

      if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
      }
    }

    const banner = await DiscoverMore.create({
      categoryId: categoryId ? Number(categoryId) : null,
      subtitle,
      title: title.trim(),
      image_url,
      href,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({
      success: true,
      message: "Discover More banner created successfully",
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.createDiscoverMore");
  }
};

/**
 * Get All Banners
 */
exports.getAllDiscoverMore = async (req, res) => {
  try {
    const banners = await DiscoverMore.findAll({
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.getAllDiscoverMore");
  }
};

/**
 * Get Active Banners
 */
exports.getActiveDiscoverMore = async (req, res) => {
  try {
    const banners = await DiscoverMore.findAll({
      where: {
        is_active: true,
      },
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.getActiveDiscoverMore");
  }
};

/**
 * Get Single Banner
 */
exports.getDiscoverMoreById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await DiscoverMore.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.getDiscoverMoreById");
  }
};

/**
 * Update Banner
 */
exports.updateDiscoverMore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await DiscoverMore.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.update(req.body);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.updateDiscoverMore");
  }
};

/**
 * Toggle Active Status
 */
exports.updateDiscoverMoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await DiscoverMore.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.update({
      is_active: !banner.is_active,
    });

    res.status(200).json({
      success: true,
      message: `Banner ${
        banner.is_active ? "activated" : "deactivated"
      } successfully`,
      data: banner,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.updateDiscoverMoreStatus");
  }
};

/**
 * Delete Banner
 */
exports.deleteDiscoverMore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid banner ID");
      err.statusCode = 400;
      throw err;
    }

    const banner = await DiscoverMore.findByPk(id);

    if (!banner) {
      const err = new Error("Banner not found");
      err.statusCode = 404;
      throw err;
    }

    await banner.destroy();

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "DiscoverMoreController.deleteDiscoverMore");
  }
};