const { Op } = require("sequelize");

const DealOfDay = require("../models/DealOfDay");
const Product = require("../models/Product");

/**
 * Create Deal Of Day
 */
exports.createDealOfDay = async (req, res) => {
  try {
    const {
      productId,
      title,
      startDate,
      endDate,
      isActive = true,
    } = req.body;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const deal = await DealOfDay.create({
      productId,
      title,
      startDate,
      endDate,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: deal,
    });
  } catch (error) {
    console.error("Create Deal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create deal",
      error: error.message,
    });
  }
};

/**
 * Get Active Deal
 */
exports.getActiveDealOfDay = async (req, res) => {
  try {
    const now = new Date();

    const deals = await DealOfDay.findAll({
      where: {
        isActive: true,
      },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    if (!deals || deals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No active deals found",
        data: []
      });
    }

    res.status(200).json({
      success: true,
      data: deals,
    });
  } catch (error) {
    console.error("Get Deal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deal",
      error: error.message,
    });
  }
};

/**
 * Get All Deals
 */
exports.getAllDeals = async (req, res) => {
  try {
    const deals = await DealOfDay.findAll({
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals,
    });
  } catch (error) {
    console.error("Get Deals Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
      error: error.message,
    });
  }
};

/**
 * Update Deal
 */
exports.updateDealOfDay = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    await deal.update(req.body);

    res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      data: deal,
    });
  } catch (error) {
    console.error("Update Deal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update deal",
      error: error.message,
    });
  }
};

/**
 * Delete Deal
 */
exports.deleteDealOfDay = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    await deal.destroy();

    res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    console.error("Delete Deal Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete deal",
      error: error.message,
    });
  }
};

/**
 * Toggle Active Status
 */
exports.updateDealStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    await deal.update({
      isActive: !deal.isActive,
    });

    res.status(200).json({
      success: true,
      message: `Deal ${
        deal.isActive ? "activated" : "deactivated"
      } successfully`,
      data: deal,
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