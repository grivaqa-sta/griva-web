const { Op } = require("sequelize");
const { DealOfDay, Product } = require("../models");
const handleApiError = require("../utils/errorHandler");

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

    if (!productId || isNaN(Number(productId))) {
      const err = new Error("Valid productId is required");
      err.statusCode = 400;
      throw err;
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      const err = new Error("Title is required");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    const deal = await DealOfDay.create({
      productId,
      title: title.trim(),
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
    return handleApiError(error, req, res, "DealOfDayController.createDealOfDay");
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
        startDate: {
          [Op.lte]: now,
        },
        endDate: {
          [Op.gte]: now,
        },
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
    return handleApiError(error, req, res, "DealOfDayController.getActiveDealOfDay");
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
    return handleApiError(error, req, res, "DealOfDayController.getAllDeals");
  }
};

/**
 * Update Deal
 */
exports.updateDealOfDay = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid deal ID");
      err.statusCode = 400;
      throw err;
    }

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      const err = new Error("Deal not found");
      err.statusCode = 404;
      throw err;
    }

    await deal.update(req.body);

    res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      data: deal,
    });
  } catch (error) {
    return handleApiError(error, req, res, "DealOfDayController.updateDealOfDay");
  }
};

/**
 * Delete Deal
 */
exports.deleteDealOfDay = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid deal ID");
      err.statusCode = 400;
      throw err;
    }

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      const err = new Error("Deal not found");
      err.statusCode = 404;
      throw err;
    }

    await deal.destroy();

    res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "DealOfDayController.deleteDealOfDay");
  }
};

/**
 * Toggle Active Status
 */
exports.updateDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid deal ID");
      err.statusCode = 400;
      throw err;
    }

    const deal = await DealOfDay.findByPk(id);

    if (!deal) {
      const err = new Error("Deal not found");
      err.statusCode = 404;
      throw err;
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
    return handleApiError(error, req, res, "DealOfDayController.updateDealStatus");
  }
};