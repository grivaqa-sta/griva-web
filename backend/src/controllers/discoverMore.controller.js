const DiscoverMore = require("../models/DiscoverMore");
const Category = require("../models/Category");

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

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const banner = await DiscoverMore.create({
      categoryId,
      subtitle,
      title,
      image_url,
      href,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Discover More banner created successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Create Discover More Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create banner",
      error: error.message,
    });
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
    console.error("Get Discover More Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch banners",
      error: error.message,
    });
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
    console.error("Get Active Discover More Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active banners",
      error: error.message,
    });
  }
};

/**
 * Get Single Banner
 */
exports.getDiscoverMoreById = async (req, res) => {
  try {
    const banner = await DiscoverMore.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Get Banner Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch banner",
      error: error.message,
    });
  }
};

/**
 * Update Banner
 */
exports.updateDiscoverMore = async (req, res) => {
  try {
    const banner = await DiscoverMore.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.update(req.body);

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Update Discover More Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update banner",
      error: error.message,
    });
  }
};

/**
 * Toggle Active Status
 */
exports.updateDiscoverMoreStatus = async (req, res) => {
  try {
    const banner = await DiscoverMore.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
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
    console.error("Status Update Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

/**
 * Delete Banner
 */
exports.deleteDiscoverMore = async (req, res) => {
  try {
    const banner = await DiscoverMore.findByPk(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    await banner.destroy();

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Discover More Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete banner",
      error: error.message,
    });
  }
};