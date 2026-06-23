const DeliverySlot = require("../models/DeliverySlot");

/**
 * Get active delivery slots sorted by sort_order
 */
exports.getDeliverySlots = async (req, res, next) => {
  try {
    const slots = await DeliverySlot.findAll({
      order: [["sort_order", "ASC"]],
    });
    res.status(200).json({ success: true, slots });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new delivery slot (Admin only)
 */
exports.createDeliverySlot = async (req, res, next) => {
  try {
    const { name, start_time, end_time, is_active, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Slot name is required." });
    }

    const slot = await DeliverySlot.create({
      name,
      start_time,
      end_time,
      is_active: is_active !== undefined ? is_active : true,
      sort_order: sort_order !== undefined ? sort_order : 0,
    });

    res.status(201).json({ success: true, message: "Delivery slot created.", slot });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing delivery slot (Admin only)
 */
exports.updateDeliverySlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, start_time, end_time, is_active, sort_order } = req.body;

    const slot = await DeliverySlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Delivery slot not found." });
    }

    if (name !== undefined) slot.name = name;
    if (start_time !== undefined) slot.start_time = start_time;
    if (end_time !== undefined) slot.end_time = end_time;
    if (is_active !== undefined) slot.is_active = is_active;
    if (sort_order !== undefined) slot.sort_order = sort_order;

    await slot.save();

    res.status(200).json({ success: true, message: "Delivery slot updated.", slot });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a delivery slot (Admin only)
 */
exports.deleteDeliverySlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slot = await DeliverySlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: "Delivery slot not found." });
    }

    await slot.destroy();

    res.status(200).json({ success: true, message: "Delivery slot deleted." });
  } catch (error) {
    next(error);
  }
};
