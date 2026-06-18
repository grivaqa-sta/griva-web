/**
 * ORDER CONTROLLER (orderController.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, transaction security is managed by adding `@Transactional` 
 * to your Service classes. If any runtime exception is thrown during execution, 
 * Spring automatically rolls back the entire database state.
 * In Sequelize, we explicitly create a transaction object (`const t = await sequelize.transaction()`) 
 * and pass it as an option to every query. We call `t.commit()` or `t.rollback()` manually.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * In Supabase, executing complex logic like order checkout with parallel stock 
 * reductions requires writing custom PL/pgSQL database functions and calling 
 * them via RPC. Here, we write it cleanly using standard JavaScript promises.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Checkout is the most critical transaction in an e-commerce platform. We must guarantee 
 * that stock levels are correctly decremented when checking out. If product stock is 
 * insufficient, we must abort the order and inform the customer.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a transaction-safe checkout system, if a customer's payment fails or the 
 * server crashes halfway through processing, you could lose money, record orders 
 * with missing items, or over-sell products that are out of stock.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always run inventory checks using locks (`lock: t.LOCK.UPDATE` equivalent) inside 
 * transactions to prevent race conditions (where two users check out the last remaining 
 * item at the exact same millisecond).
 */

const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const User = require("../models/User");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const SiteSetting = require("../models/SiteSetting");

/**
 * Generate a production-safe order number: GRV-YYYYMMDD-XXXX
 * Runs inside a transaction to prevent duplicates under concurrency.
 */
async function generateOrderNumber(transaction) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;
  const prefix = `GRV-${dateStr}-`;

  // Find the highest order number for today
  const lastOrder = await Order.findOne({
    where: {
      order_number: { [Op.like]: `${prefix}%` },
    },
    order: [["order_number", "DESC"]],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  let nextSeq = 1;
  if (lastOrder && lastOrder.order_number) {
    const lastSeq = parseInt(lastOrder.order_number.split("-").pop(), 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

exports.createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      items,
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      payment_method,
      payment_status,
      delivery_notes,
      city,
      // Also accept camelCase from older frontend calls
      shippingAddress,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      paymentStatus,
      deliveryNotes,
    } = req.body;

    // Accept both camelCase and snake_case field names
    const resolvedAddress   = shipping_address || shippingAddress;
    const resolvedName      = customer_name    || customerName    || null;
    const resolvedPhone     = customer_phone   || customerPhone   || null;
    const resolvedEmail     = customer_email   || customerEmail   || null;
    const resolvedMethod    = payment_method   || paymentMethod   || "COD";
    const resolvedStatus    = payment_status   || paymentStatus   || "unpaid";
    const resolvedNotes     = delivery_notes   || deliveryNotes   || null;
    const resolvedCity      = city || null;

    const userId = req.user ? req.user.id : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items list is missing or empty." });
    }

    if (!resolvedAddress) {
      return res.status(400).json({ error: "Shipping delivery address is required." });
    }

    let calculatedTotal = 0;
    const itemsToCreate = [];
    const orderSummaryLines = [];

    for (const item of items) {
      // Accept product_id OR id from frontend
      const productId = item.product_id || item.id;
      const product = await Product.findByPk(productId, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ID ${productId} not found.` });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(409).json({
          error: `Insufficient stock for '${product.title}'. Only ${product.stock} units available.`,
        });
      }

      product.stock -= item.quantity;
      await product.save({ transaction });

      const unitPrice = parseFloat(product.getDataValue("price"));
      calculatedTotal += unitPrice * item.quantity;

      itemsToCreate.push({
        product_id: product.id,
        quantity: item.quantity,
        selected_color: item.selectedColor || item.selected_color || null,
        selected_storage: item.selectedStorage || item.selected_storage || null,
        price_at_purchase: unitPrice,
      });

      orderSummaryLines.push(`▪ ${product.title} x${item.quantity} — QAR ${unitPrice}`);
    }

    // Generate production-safe order number: GRV-YYYYMMDD-XXXX
    const orderNumber = await generateOrderNumber(transaction);

    const order = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      total_price: calculatedTotal,
      shipping_address: resolvedAddress,
      status: "pending",
      customer_name: resolvedName,
      customer_phone: resolvedPhone,
      customer_email: resolvedEmail,
      payment_method: resolvedMethod,
      payment_status: resolvedStatus,
      delivery_notes: resolvedNotes,
      city: resolvedCity,
    }, { transaction });

    const finalizedItems = itemsToCreate.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(finalizedItems, { transaction });

    // Clear the user's database cart after successful order placement
    if (userId) {
      const userCart = await Cart.findOne({ where: { user_id: userId }, transaction });
      if (userCart) {
        await CartItem.destroy({ where: { cart_id: userCart.id }, transaction });
      }
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_price: order.total_price,
        payment_method: order.payment_method,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};


/**
 * Fetch personal order receipts for the logged-in customer
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url"],
          },
        },
      ],
      order: [["createdAt", "DESC"]], // Return latest orders first
    });

    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Action: Update Order Status (Pending -> Shipped -> Completed)
 * Powers: Admin order processing dashboard
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Order status parameter is required." });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all platform order receipts (Admin Panel)
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate dynamic e-commerce business analytics (Admin Panel)
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{
            model: Product,
            as: "product",
            attributes: ["id", "title", "price"],
            include: [{
              model: SubCategory,
              as: "subcategory",
              attributes: ["id", "title"],
              include: [{
                model: Category,
                as: "category",
                attributes: ["id", "title"],
              }]
            }]
          }]
        }
      ]
    });

    let totalSales = 0;
    let totalOrders = orders.length;
    let uniqueUserIds = new Set();
    let orderStatusCounts = { pending: 0, shipped: 0, completed: 0, cancelled: 0 };
    let categorySalesMap = {};
    let dateSalesMap = {};

    orders.forEach((order) => {
      // Clean '$' symbol if formatted in getters
      const rawPrice = order.getDataValue("total_price");
      const orderTotal = typeof rawPrice === "string" ? parseFloat(rawPrice.replace(/([$]|qar|[\s,])/gi, "")) : parseFloat(rawPrice) || 0;
      
      totalSales += orderTotal;
      uniqueUserIds.add(order.user_id);

      const status = order.status || "pending";
      if (orderStatusCounts[status] !== undefined) {
        orderStatusCounts[status]++;
      }

      // Format Date: e.g. "Jun 09"
      const dateKey = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      dateSalesMap[dateKey] = (dateSalesMap[dateKey] || 0) + orderTotal;

      if (order.items) {
        order.items.forEach((item) => {
          const categoryTitle = item.product?.subcategory?.category?.title || "Other";
          const itemPrice = typeof item.price_at_purchase === "string" 
            ? parseFloat(item.price_at_purchase.replace(/([$]|qar|[\s,])/gi, "")) 
            : parseFloat(item.price_at_purchase) || 0;
          const itemTotal = itemPrice * (item.quantity || 1);
          categorySalesMap[categoryTitle] = (categorySalesMap[categoryTitle] || 0) + itemTotal;
        });
      }
    });

    const totalCustomers = uniqueUserIds.size;
    const averageOrderValue = totalOrders > 0 ? (totalSales / totalOrders) : 0;

    const salesByCategory = Object.keys(categorySalesMap).map((cat) => ({
      category: cat,
      sales: parseFloat(categorySalesMap[cat].toFixed(2)),
    }));

    const salesOverTime = Object.keys(dateSalesMap).map((date) => ({
      date,
      sales: parseFloat(dateSalesMap[date].toFixed(2)),
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({
      analytics: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        totalCustomers,
        salesByCategory,
        orderStatusCounts,
        salesOverTime,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────
// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs
// ─────────────────────────────────────────────────────────

/**
 * PATCH /api/orders/:id/assign
 * Admin assigns a delivery boy to an order
 */
exports.assignDeliveryBoy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryBoyId } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({
        success: false,
        message: "deliveryBoyId is required.",
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Verify the delivery boy exists and has role 'delivery'
    const deliveryBoy = await User.findByPk(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery boy ID or user is not a delivery staff member.",
      });
    }

    order.delivery_boy_id = deliveryBoyId;
    order.assigned_at = new Date();
    order.status = "assigned";
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${order.order_number || order.id} assigned to ${deliveryBoy.name}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/delivery-boys
 * Admin fetches all delivery boy accounts with active order count
 */
exports.getDeliveryBoys = async (req, res, next) => {
  try {
    const deliveryBoys = await User.findAll({
      where: { role: "delivery" },
      attributes: ["id", "name", "email", "createdAt"],
    });

    // Count active (non-delivered, non-cancelled) orders per driver
    const result = [];
    for (const driver of deliveryBoys) {
      const activeOrderCount = await Order.count({
        where: {
          delivery_boy_id: driver.id,
          status: {
            [Op.notIn]: ["delivered", "completed", "cancelled"],
          },
        },
      });

      result.push({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        activeOrderCount,
        createdAt: driver.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      deliveryBoys: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/orders/admin/delivery-boys
 * Admin creates/registers a new delivery boy account
 */
exports.createDeliveryBoy = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const newDriver = await User.create({
      name,
      email,
      password,
      role: "delivery",
    });

    res.status(201).json({
      success: true,
      message: "Delivery boy account created successfully.",
      deliveryBoy: {
        id: newDriver.id,
        name: newDriver.name,
        email: newDriver.email,
        role: newDriver.role,
        createdAt: newDriver.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
