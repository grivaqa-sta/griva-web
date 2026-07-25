// FEATURE: Delivery Attempt Management and Order Reopen System
// File: backend/src/controllers/deliveryAttemptController.js
// Do not modify without reading feature documentation

const { Op } = require("sequelize");
const { emitToRoles, emitToUser, emitToAll, emitToOrder } = require("../socket/socket");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const User = require("../models/User");
const handleApiError = require("../utils/errorHandler");

const markAttempted = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid order ID");
      err.statusCode = 400;
      throw err;
    }

    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.delivery_boy_id !== req.user.id) {
      const err = new Error("This order is not assigned to you.");
      err.statusCode = 403;
      throw err;
    }

    if (order.status !== "out_for_delivery") {
      const err = new Error("Order must be out for delivery to mark as attempted.");
      err.statusCode = 400;
      throw err;
    }

    order.delivery_attempts += 1;
    order.attempt_notes = note || null;
    order.failed_reason = "not_answering";
    order.status = "attempted";
    await order.save();

    try {
      emitToRoles(["admin", "staff"], "order-status-updated", { orderId: order.id, status: order.status });
      emitToRoles(["admin", "staff"], "order-updated", { orderId: order.id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      emitToOrder(order.id, "order-status-updated", { orderId: order.id, status: order.status });
      if (order.delivery_boy_id) {
        emitToUser(order.delivery_boy_id, "order-status-updated", { orderId: order.id, status: order.status });
        emitToUser(order.delivery_boy_id, "order-updated", { orderId: order.id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Emission Error]:", socketErr.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    return handleApiError(error, req, res, "DeliveryAttemptController.markAttempted");
  }
};

const markRescheduled = async (req, res) => {
  try {
    const { id } = req.params;
    const { rescheduleTime, note } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid order ID");
      err.statusCode = 400;
      throw err;
    }

    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.delivery_boy_id !== req.user.id) {
      const err = new Error("This order is not assigned to you.");
      err.statusCode = 403;
      throw err;
    }

    if (order.status !== "out_for_delivery") {
      const err = new Error("Order must be out for delivery to mark as rescheduled.");
      err.statusCode = 400;
      throw err;
    }

    if (!rescheduleTime) {
      const err = new Error("Reschedule time is required.");
      err.statusCode = 400;
      throw err;
    }

    order.delivery_attempts += 1;
    order.reschedule_time = new Date(rescheduleTime);
    order.attempt_notes = note || null;
    order.failed_reason = "rescheduled";
    order.status = "rescheduled";
    await order.save();

    try {
      emitToRoles(["admin", "staff"], "order-status-updated", { orderId: order.id, status: order.status });
      emitToRoles(["admin", "staff"], "order-updated", { orderId: order.id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      emitToOrder(order.id, "order-status-updated", { orderId: order.id, status: order.status });
      if (order.delivery_boy_id) {
        emitToUser(order.delivery_boy_id, "order-status-updated", { orderId: order.id, status: order.status });
        emitToUser(order.delivery_boy_id, "order-updated", { orderId: order.id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Emission Error]:", socketErr.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    return handleApiError(error, req, res, "DeliveryAttemptController.markRescheduled");
  }
};

const markFailed = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, note } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid order ID");
      err.statusCode = 400;
      throw err;
    }

    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    if (order.delivery_boy_id !== req.user.id) {
      const err = new Error("This order is not assigned to you.");
      err.statusCode = 403;
      throw err;
    }

    if (order.status !== "out_for_delivery" && order.status !== "attempted") {
      const err = new Error("Order must be out for delivery or attempted to mark as failed.");
      err.statusCode = 400;
      throw err;
    }

    const allowedReasons = ["customer_refused", "wrong_address"];
    if (!reason || !allowedReasons.includes(reason)) {
      const err = new Error("Invalid reason. Use customer_refused or wrong_address.");
      err.statusCode = 400;
      throw err;
    }

    order.delivery_attempts += 1;
    order.failed_reason = reason;
    order.attempt_notes = note || null;
    order.status = "failed";
    await order.save();

    try {
      emitToRoles(["admin", "staff"], "order-status-updated", { orderId: order.id, status: order.status });
      emitToRoles(["admin", "staff"], "order-updated", { orderId: order.id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      emitToOrder(order.id, "order-status-updated", { orderId: order.id, status: order.status });
      if (order.delivery_boy_id) {
        emitToUser(order.delivery_boy_id, "order-status-updated", { orderId: order.id, status: order.status });
        emitToUser(order.delivery_boy_id, "order-updated", { orderId: order.id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Emission Error]:", socketErr.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    return handleApiError(error, req, res, "DeliveryAttemptController.markFailed");
  }
};

const reopenOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid order ID");
      err.statusCode = 400;
      throw err;
    }

    const order = await Order.findByPk(id);
    if (!order) {
      const err = new Error("Order not found.");
      err.statusCode = 404;
      throw err;
    }

    const allowedStatuses = ["cancelled", "attempted", "failed"];
    if (!allowedStatuses.includes(order.status)) {
      const err = new Error("Only cancelled, attempted, or failed orders can be reopened.");
      err.statusCode = 400;
      throw err;
    }

    if (order.reopen_count >= 2) {
      const err = new Error("This order has been reopened too many times. Maximum is 2 reopens. Please create a new order for the customer.");
      err.statusCode = 400;
      throw err;
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

    try {
      emitToRoles(["admin", "staff"], "order-status-updated", { orderId: order.id, status: order.status });
      emitToRoles(["admin", "staff"], "order-updated", { orderId: order.id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      emitToOrder(order.id, "order-status-updated", { orderId: order.id, status: order.status });
      if (order.delivery_boy_id) {
        emitToUser(order.delivery_boy_id, "order-status-updated", { orderId: order.id, status: order.status });
        emitToUser(order.delivery_boy_id, "order-updated", { orderId: order.id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Emission Error]:", socketErr.message);
    }

    res.json({ success: true, data: order, message: "Order reopened successfully. Please assign a delivery driver." });
  } catch (error) {
    return handleApiError(error, req, res, "DeliveryAttemptController.reopenOrder");
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
    return handleApiError(error, req, res, "DeliveryAttemptController.getNeedsAttention");
  }
};

module.exports = {
  markAttempted,
  markRescheduled,
  markFailed,
  reopenOrder,
  getNeedsAttention,
};
