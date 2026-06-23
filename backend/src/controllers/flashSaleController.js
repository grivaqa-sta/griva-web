const FlashSale = require("../models/FlashSale");
const FlashSaleProduct = require("../models/FlashSaleProduct");
const Product = require("../models/Product");

exports.getActiveFlashSale = async (req, res, next) => {
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

    res.status(200).json({ activeSale });
  } catch (error) {
    next(error);
  }
};

exports.getFlashSales = async (req, res, next) => {
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
    res.status(200).json({ sales });
  } catch (error) {
    next(error);
  }
};

exports.createFlashSale = async (req, res, next) => {
  try {
    const { title, start_time, end_time, is_active } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: "Missing campaign details." });
    }

    if (is_active) {
      // Deactivate other sales if this one is active
      await FlashSale.update({ is_active: false }, { where: { is_active: true } });
    }

    const sale = await FlashSale.create({
      title,
      start_time,
      end_time,
      is_active: is_active !== undefined ? !!is_active : true,
    });

    res.status(201).json({
      message: "Flash sale campaign created successfully.",
      sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, start_time, end_time, is_active } = req.body;

    const sale = await FlashSale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: "Flash sale not found." });
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
      message: "Flash sale updated successfully.",
      sale,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sale = await FlashSale.findByPk(id);
    if (!sale) {
      return res.status(404).json({ error: "Flash sale not found." });
    }

    await sale.destroy();
    res.status(200).json({ message: "Flash sale campaign deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.addProductToFlashSale = async (req, res, next) => {
  try {
    const { flash_sale_id, product_id, flash_price, flash_stock } = req.body;
    if (!flash_sale_id || !product_id || !flash_price) {
      return res.status(400).json({ error: "Missing required associations." });
    }

    const item = await FlashSaleProduct.create({
      flash_sale_id,
      product_id,
      flash_price,
      flash_stock: flash_stock || 0,
    });

    res.status(201).json({
      message: "Product linked to flash sale successfully.",
      item,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeProductFromFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await FlashSaleProduct.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Flash sale product relation not found." });
    }

    await item.destroy();
    res.status(200).json({ message: "Product removed from flash sale campaign." });
  } catch (error) {
    next(error);
  }
};
