// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

const { Op } = require("sequelize");
const { emitToRoles, emitToUser, emitToAll, emitToOrder } = require("../socket/socket");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const User = require("../models/User");
const {
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
} = require("../services/brevoService");

/**
 * GET /api/delivery/my-orders
 * Fetch today's orders assigned to the logged-in delivery boy
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    // Today's date range (midnight to midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        delivery_boy_id: driverId,
        [Op.or]: [
          {
            status: {
              [Op.in]: ["assigned", "out_for_delivery", "attempted", "rescheduled"]
            }
          },
          {
            status: {
              [Op.in]: ["delivered", "failed", "cancelled", "returned"]
            },
            [Op.or]: [
              {
                assigned_at: {
                  [Op.between]: [todayStart, todayEnd]
                }
              },
              {
                updatedAt: {
                  [Op.between]: [todayStart, todayEnd]
                }
              }
            ]
          }
        ]
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url", "price", "gallery_images"],
          },
        },
      ],
      order: [["assigned_at", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/delivery/orders/:id/status
 * Delivery boy updates order status
 * Allowed transitions:
 *   'assigned' → 'out_for_delivery'
 *   'out_for_delivery' → 'delivered'
 */
exports.updateMyOrderStatus = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Ensure this order is assigned to the requesting driver
    if (order.delivery_boy_id !== driverId) {
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you.",
      });
    }

    // Validate allowed status transitions for delivery boy
    const allowedTransitions = {
      assigned: ["out_for_delivery"],
      attempted: ["out_for_delivery"],
      rescheduled: ["out_for_delivery"],
      out_for_delivery: ["delivered"],
    };

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${order.status}' to '${status}'. Allowed transitions: '${order.status}' → ${allowed.length ? allowed.map(x => `'${x}'`).join(", ") : "'none'"}.`,
      });
    }

    // order.status = status;
    // await order.save();

    // res.status(200).json({
    //   success: true,
    //   message: `Order status updated to '${status}'.`,
    //   order,
    // });
    order.status = status;
    if (status === "delivered") {
      const { delivery_payment_method } = req.body;
      if (delivery_payment_method) {
        order.delivery_payment_method = delivery_payment_method;
        if (delivery_payment_method === "Cash") {
          order.cash_reconciliation_status = "pending";
        } else {
          order.cash_reconciliation_status = "not_applicable";
        }
      } else {
        order.cash_reconciliation_status = "not_applicable";
      }
      order.payment_status = "paid";
    }
    await order.save();

    try {
      emitToRoles(["admin", "staff"], "order-status-updated", { orderId: order.id, status });
      emitToRoles(["admin", "staff"], "order-updated", { orderId: order.id });
      emitToRoles(["admin", "staff"], "dashboard-metrics-updated");
      emitToOrder(order.id, "order-status-updated", { orderId: order.id, status });
      if (order.delivery_boy_id) {
        emitToUser(order.delivery_boy_id, "order-status-updated", { orderId: order.id, status });
        emitToUser(order.delivery_boy_id, "order-updated", { orderId: order.id });
      }
    } catch (socketErr) {
      console.error("🔌 [Socket.IO Emission Error]:", socketErr.message);
    }

    if (status === "out_for_delivery") {
      try {
        await sendOutForDeliveryEmail(order);
      } catch (error) {
        console.error(
          "Out for delivery email failed:",
          error.message
        );
      }
    }

    if (status === "delivered") {
      try {
        await sendOrderDeliveredEmail(order);
      } catch (error) {
        console.error(
          "Delivered email failed:",
          error.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/history
 * Fetch completed deliveries for the last 7 days
 */
exports.getMyDeliveryHistory = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await Order.findAll({
      where: {
        delivery_boy_id: driverId,
        status: "delivered",
        updatedAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url", "price", "gallery_images"],
          },
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/orders/:id
 * Fetch details of a specific order assigned to the logged-in delivery boy
 */
exports.getOrderDetails = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        delivery_boy_id: driverId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url", "price", "gallery_images"],
          },
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not assigned to you.",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
