// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

const { Op } = require("sequelize");
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
        assigned_at: {
          [Op.between]: [todayStart, todayEnd],
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
      assigned: "out_for_delivery",
      out_for_delivery: "delivered",
    };

    if (allowedTransitions[order.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from '${order.status}' to '${status}'. Allowed: '${order.status}' → '${allowedTransitions[order.status] || "none"}'.`,
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
await order.save();

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
