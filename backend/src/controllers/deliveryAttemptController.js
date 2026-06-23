// FEATURE: Delivery Attempt Management and Order Reopen System
// File: backend/src/controllers/deliveryAttemptController.js
// Do not modify without reading feature documentation

const { Op } = require("sequelize");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const User = require("../models/User");

const markAttempted = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.delivery_boy_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "This order is not assigned to you." });
    }

    if (order.status !== "out_for_delivery") {
      return res.status(400).json({ success: false, message: "Order must be out for delivery to mark as attempted." });
    }

    order.delivery_attempts += 1;
    order.attempt_notes = note || null;
    order.failed_reason = "not_answering";
    order.status = "attempted";
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("markAttempted error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const markRescheduled = async (req, res) => {
  try {
    const { id } = req.params;
    const { rescheduleTime, note } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.delivery_boy_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "This order is not assigned to you." });
    }

    if (order.status !== "out_for_delivery") {
      return res.status(400).json({ success: false, message: "Order must be out for delivery to mark as rescheduled." });
    }

    if (!rescheduleTime) {
      return res.status(400).json({ success: false, message: "Reschedule time is required." });
    }

    order.delivery_attempts += 1;
    order.reschedule_time = new Date(rescheduleTime);
    order.attempt_notes = note || null;
    order.failed_reason = "rescheduled";
    order.status = "rescheduled";
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("markRescheduled error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const markFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.delivery_boy_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "This order is not assigned to you." });
    }

    if (order.status !== "out_for_delivery" && order.status !== "attempted") {
      return res.status(400).json({ success: false, message: "Order must be out for delivery or attempted to mark as failed." });
    }

    const allowedReasons = ["customer_refused", "wrong_address"];
    if (!reason || !allowedReasons.includes(reason)) {
      return res.status(400).json({ success: false, message: "Invalid reason. Use customer_refused or wrong_address." });
    }

    order.delivery_attempts += 1;
    order.failed_reason = reason;
    order.attempt_notes = note || null;
    order.status = "failed";
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("markFailed error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const reopenOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const allowedStatuses = ["cancelled", "attempted", "failed"];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({ success: false, message: "Only cancelled, attempted, or failed orders can be reopened." });
    }

    if (order.reopen_count >= 2) {
      return res.status(400).json({ success: false, message: "This order has been reopened too many times. Maximum is 2 reopens. Please create a new order for the customer." });
    }

    order.status = "processing";
    order.reopen_count += 1;
    order.reopened_at = new Date();
    order.reopened_by = req.user.id;
    order.delivery_attempts = 0;
    order.failed_reason = null;
    order.reschedule_time = null;
    order.delivery_boy_id = null;
    order.assigned_at = null;
    order.attempt_notes = "Reopened by admin: " + (note || "");
    await order.save();

    res.json({ success: true, data: order, message: "Order reopened successfully. Please assign a delivery driver." });
  } catch (error) {
    console.error("reopenOrder error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const getNeedsAttention = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        status: { [Op.in]: ["attempted", "rescheduled", "failed"] },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "deliveryBoy",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title"],
          },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error("getNeedsAttention error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  markAttempted,
  markRescheduled,
  markFailed,
  reopenOrder,
  getNeedsAttention,
};
