const DeliverySlot = require("../models/DeliverySlot");
const handleApiError = require("../utils/errorHandler");

/**
 * Get active delivery slots sorted by sort_order
 */
exports.getDeliverySlots = async (req, res) => {
  try {
    const slots = await DeliverySlot.findAll({
      order: [["sort_order", "ASC"]],
    });
    res.status(200).json({ success: true, slots });
  } catch (error) {
    return handleApiError(error, req, res, "DeliverySlotController.getDeliverySlots");
  }
};

/**
 * Create a new delivery slot (Admin only)
 */
exports.createDeliverySlot = async (req, res) => {
  try {
    const { name, start_time, end_time, is_active, sort_order } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      const err = new Error("Slot name is required.");
      err.statusCode = 400;
      throw err;
    }

    const slot = await DeliverySlot.create({
      name: name.trim(),
      start_time,
      end_time,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      sort_order: sort_order !== undefined ? Number(sort_order) : 0,
    });

    res.status(201).json({ success: true, message: "Delivery slot created.", slot });
  } catch (error) {
    return handleApiError(error, req, res, "DeliverySlotController.createDeliverySlot");
  }
};

/**
 * Update an existing delivery slot (Admin only)
 */
exports.updateDeliverySlot = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid delivery slot ID.");
      err.statusCode = 400;
      throw err;
    }

    const { name, start_time, end_time, is_active, sort_order } = req.body;

    const slot = await DeliverySlot.findByPk(id);
    if (!slot) {
      const err = new Error("Delivery slot not found.");
      err.statusCode = 404;
      throw err;
    }

    if (name !== undefined) slot.name = name;
    if (start_time !== undefined) slot.start_time = start_time;
    if (end_time !== undefined) slot.end_time = end_time;
    if (is_active !== undefined) slot.is_active = is_active;
    if (sort_order !== undefined) slot.sort_order = sort_order;

    await slot.save();

    res.status(200).json({ success: true, message: "Delivery slot updated.", slot });
  } catch (error) {
    return handleApiError(error, req, res, "DeliverySlotController.updateDeliverySlot");
  }
};

/**
 * Delete a delivery slot (Admin only)
 */
exports.deleteDeliverySlot = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid delivery slot ID.");
      err.statusCode = 400;
      throw err;
    }

    const slot = await DeliverySlot.findByPk(id);
    if (!slot) {
      const err = new Error("Delivery slot not found.");
      err.statusCode = 404;
      throw err;
    }

    await slot.destroy();

    res.status(200).json({ success: true, message: "Delivery slot deleted." });
  } catch (error) {
    return handleApiError(error, req, res, "DeliverySlotController.deleteDeliverySlot");
  }
};
