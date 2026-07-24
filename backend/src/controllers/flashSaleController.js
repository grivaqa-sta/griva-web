const FlashSale = require("../models/FlashSale");
const FlashSaleProduct = require("../models/FlashSaleProduct");
const Product = require("../models/Product");
const handleApiError = require("../utils/errorHandler");

exports.getActiveFlashSale = async (req, res) => {
  try {
    const activeSale = await FlashSale.findOne({
      where: { is_active: true },
      include: [
        {
          model: FlashSaleProduct,
          as: "campaignProducts",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, activeSale });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.getActiveFlashSale");
  }
};

exports.getFlashSales = async (req, res) => {
  try {
    const sales = await FlashSale.findAll({
      include: [
        {
          model: FlashSaleProduct,
          as: "campaignProducts",
          include: [{ model: Product, as: "product", attributes: ["id", "title"] }],
        },
      ],
      order: [["id", "DESC"]],
    });
    res.status(200).json({ success: true, sales });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.getFlashSales");
  }
};

exports.createFlashSale = async (req, res) => {
  try {
    const { title, start_time, end_time, is_active } = req.body;
    if (!title || typeof title !== "string" || !title.trim() || !start_time || !end_time) {
      const err = new Error("Missing campaign details.");
      err.statusCode = 400;
      throw err;
    }

    if (is_active) {
      await FlashSale.update({ is_active: false }, { where: { is_active: true } });
    }

    const sale = await FlashSale.create({
      title: title.trim(),
      start_time,
      end_time,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({
      success: true,
      message: "Flash sale campaign created successfully.",
      sale,
    });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.createFlashSale");
  }
};

exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid flash sale ID.");
      err.statusCode = 400;
      throw err;
    }

    const { title, start_time, end_time, is_active } = req.body;

    const sale = await FlashSale.findByPk(id);
    if (!sale) {
      const err = new Error("Flash sale not found.");
      err.statusCode = 404;
      throw err;
    }

    if (is_active) {
      await FlashSale.update({ is_active: false }, { where: { is_active: true } });
    }

    if (title !== undefined) sale.title = title;
    if (start_time !== undefined) sale.start_time = start_time;
    if (end_time !== undefined) sale.end_time = end_time;
    if (is_active !== undefined) sale.is_active = is_active;

    await sale.save();

    res.status(200).json({
      success: true,
      message: "Flash sale updated successfully.",
      sale,
    });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.updateFlashSale");
  }
};

exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid flash sale ID.");
      err.statusCode = 400;
      throw err;
    }

    const sale = await FlashSale.findByPk(id);
    if (!sale) {
      const err = new Error("Flash sale not found.");
      err.statusCode = 404;
      throw err;
    }

    await sale.destroy();
    res.status(200).json({ success: true, message: "Flash sale campaign deleted successfully." });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.deleteFlashSale");
  }
};

exports.addProductToFlashSale = async (req, res) => {
  try {
    const { flash_sale_id, product_id, flash_price, flash_stock } = req.body;
    if (!flash_sale_id || isNaN(Number(flash_sale_id)) || !product_id || isNaN(Number(product_id)) || flash_price === undefined || isNaN(Number(flash_price))) {
      const err = new Error("Missing required associations.");
      err.statusCode = 400;
      throw err;
    }

    const item = await FlashSaleProduct.create({
      flash_sale_id,
      product_id,
      flash_price,
      flash_stock: flash_stock || 0,
    });

    res.status(201).json({
      success: true,
      message: "Product linked to flash sale successfully.",
      item,
    });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.addProductToFlashSale");
  }
};

exports.removeProductFromFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid item ID.");
      err.statusCode = 400;
      throw err;
    }

    const item = await FlashSaleProduct.findByPk(id);
    if (!item) {
      const err = new Error("Flash sale product relation not found.");
      err.statusCode = 404;
      throw err;
    }

    await item.destroy();
    res.status(200).json({ success: true, message: "Product removed from flash sale campaign." });
  } catch (error) {
    return handleApiError(error, req, res, "FlashSaleController.removeProductFromFlashSale");
  }
};
