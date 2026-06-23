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
// const {
//   sendAdminOrderNotification,
//   sendOrderShippedEmail,
//   sendOrderDeliveredEmail,
// } = require("../services/brevoService");

const {
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
} = require("../services/brevoService");
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
  let transaction;

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
    const resolvedNotes     = delivery_notes   || deliveryNotes   || null;
    const resolvedCity      = city || null;
    const resolvedSlotId    = req.body.delivery_slot_id || req.body.deliverySlotId || null;

    // CRIT-2: Hardcode payment status to unpaid for COD to prevent tampering
    const resolvedStatus    = "unpaid";

    const userId = req.user ? req.user.id : null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items list is missing or empty." });
    }

    if (!resolvedAddress) {
      return res.status(400).json({ error: "Shipping delivery address is required." });
    }

    if (!resolvedSlotId) {
      return res.status(400).json({ error: "Preferred delivery time slot is required." });
    }

    if (!resolvedEmail) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resolvedEmail)) {
      return res.status(400).json({ error: "Invalid email address format." });
    }

    // CRIT-5: Validate name/phone are present
    if (!resolvedName || !resolvedName.trim()) {
      return res.status(400).json({ error: "Customer name is required." });
    }
    if (!resolvedPhone || !resolvedPhone.trim()) {
      return res.status(400).json({ error: "Customer phone is required." });
    }

    // HIGH-5: Qatar phone regex validation
    const cleanedPhone = resolvedPhone.replace(/[\s\-\(\)]/g, "");
    const qatarPhoneRegex = /^(?:\+?974|00974)?[3567]\d{7}$/;
    if (!qatarPhoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ error: "Invalid Qatar phone number format. Must be an 8-digit number (optionally starting with +974) starting with 3, 5, 6, or 7." });
    }

    // CRIT-3: Backend Idempotency check before transaction
    const tokenVal = req.body.checkout_token || req.body.checkoutToken || null;
    if (tokenVal) {
      const existingOrder = await Order.findOne({
        where: { checkout_token: tokenVal },
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
      });
      if (existingOrder) {
        return res.status(201).json({
          success: true,
          message: "Order already placed successfully (idempotent response).",
          order: {
            id: existingOrder.id,
            order_number: existingOrder.order_number,
            status: existingOrder.status,
            total_price: existingOrder.total_price,
            payment_method: existingOrder.payment_method,
            createdAt: existingOrder.createdAt,
            delivery_slot_id: existingOrder.delivery_slot_id,
          },
        });
      }
    }

    transaction = await sequelize.transaction();

    // CRIT-3: DB double-lock check inside transaction
    if (tokenVal) {
      const existingOrder = await Order.findOne({
        where: { checkout_token: tokenVal },
        transaction,
      });
      if (existingOrder) {
        await transaction.rollback();
        return res.status(201).json({
          success: true,
          message: "Order already placed successfully (idempotent response).",
          order: {
            id: existingOrder.id,
            order_number: existingOrder.order_number,
            status: existingOrder.status,
            total_price: existingOrder.total_price,
            payment_method: existingOrder.payment_method,
            createdAt: existingOrder.createdAt,
            delivery_slot_id: existingOrder.delivery_slot_id,
          },
        });
      }
    }

    const DeliverySlot = require("../models/DeliverySlot");
    const activeSlot = await DeliverySlot.findByPk(resolvedSlotId, { transaction });
    if (!activeSlot || !activeSlot.is_active) {
      await transaction.rollback();
      return res.status(400).json({ error: "Selected delivery slot is invalid or inactive." });
    }

    let calculatedTotal = 0;
    const itemsToCreate = [];
    const orderSummaryLines = [];

    for (const item of items) {
      // Accept product_id OR id from frontend
      const productId = item.product_id || item.id;

      // HIGH-6: Parse and validate qty
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0 || qty > 100) {
        await transaction.rollback();
        return res.status(400).json({ error: "Item quantity must be a positive integer not exceeding 100." });
      }

      // CRIT-1: DB Lock using transaction.LOCK.UPDATE to prevent overselling race conditions
      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ID ${productId} not found.` });
      }

      // CRIT-4: Check product is_active status
      if (!product.is_active) {
        await transaction.rollback();
        return res.status(400).json({ error: `Product '${product.title}' is currently inactive and cannot be ordered.` });
      }

      if (product.stock < qty) {
        await transaction.rollback();
        return res.status(409).json({
          error: `Insufficient stock for '${product.title}'. Only ${product.stock} units available.`,
          code: "INSUFFICIENT_STOCK",
          details: {
            productId: product.id,
            title: product.title,
            requestedQuantity: qty,
            availableStock: product.stock,
          },
        });
      }

      product.stock -= qty;
      await product.save({ transaction });

      const unitPrice = parseFloat(product.getDataValue("price"));
      calculatedTotal += unitPrice * qty;

      itemsToCreate.push({
        product_id: product.id,
        quantity: qty,
        selected_color: item.selectedColor || item.selected_color || null,
        selected_storage: item.selectedStorage || item.selected_storage || null,
        price_at_purchase: unitPrice,
      });

      orderSummaryLines.push(`▪ ${product.title} x${qty} — QAR ${unitPrice}`);
    }

    // Fetch site settings for shipping fee calculation
    const settings = await SiteSetting.findOne({ transaction });
    const shippingFee = settings ? parseFloat(settings.shippingFee) : 15.00;
    const freeShippingThreshold = settings ? parseFloat(settings.freeShippingThreshold) : 150.00;

    let finalTotal = calculatedTotal;
    if (calculatedTotal < freeShippingThreshold && calculatedTotal > 0) {
      finalTotal += shippingFee;
    }

    // Generate production-safe order number: GRV-YYYYMMDD-XXXX
    const orderNumber = await generateOrderNumber(transaction);

    const order = await Order.create({
      order_number: orderNumber,
      user_id: userId,
      total_price: finalTotal,
      shipping_address: resolvedAddress,
      status: "pending",
      customer_name: resolvedName,
      customer_phone: cleanedPhone,
      customer_email: resolvedEmail,
      payment_method: resolvedMethod,
      payment_status: resolvedStatus,
      delivery_notes: resolvedNotes,
      city: resolvedCity,
      delivery_slot_id: resolvedSlotId,
      checkout_token: tokenVal,
    }, { transaction });


    const finalizedItems = itemsToCreate.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(finalizedItems, { transaction });

    const productCount = items.length;

    const totalQuantity = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
    // Clear the user's database cart after successful order placement
    if (userId) {
      const userCart = await Cart.findOne({ where: { user_id: userId }, transaction });
      if (userCart) {
        await CartItem.destroy({ where: { cart_id: userCart.id }, transaction });
      }
    }

    await transaction.commit();
    // await sendAdminOrderNotification(order);
    try {
      await sendAdminOrderNotification(order);
    } catch (error) {
      console.error("Admin email failed:", error.message);
    }

    try {
      await sendCustomerOrderConfirmation(
        order,
        productCount,
        totalQuantity
      );
    } catch (error) {
      console.error(
        "Customer confirmation email failed:",
        error.message
      );
    }
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
        delivery_slot_id: order.delivery_slot_id,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

/**
 * Guest Order Tracking — look up order by order_number + phone
 * GET /api/orders/track?order_number=GRV-...&phone=+974...
 * No authentication required.
 */
exports.trackGuestOrder = async (req, res, next) => {
  try {
    const { order_number, phone } = req.query;

    if (!order_number || !phone) {
      return res.status(400).json({
        success: false,
        message: "Both order_number and phone are required.",
      });
    }

    // HIGH-2: Exact phone verification using normalized values (anti-IDOR)
    const queryDigits = phone.replace(/\D/g, "");
    const stripQatarPrefix = (numStr) => numStr.replace(/^(974|00974)/, "");
    const normalizedQuery = stripQatarPrefix(queryDigits);

    if (!normalizedQuery) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }

    const DeliverySlot = require("../models/DeliverySlot");
    const order = await Order.findOne({
      where: {
        order_number,
      },
      include: [
        {
          model: DeliverySlot,
          as: "deliverySlot",
          attributes: ["id", "name", "start_time", "end_time"],
        },
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["id", "title", "main_image_url", "price"],
          },
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your order number and phone number.",
      });
    }

    const dbDigits = (order.customer_phone || "").replace(/\D/g, "");
    const normalizedDb = stripQatarPrefix(dbDigits);

    if (normalizedQuery !== normalizedDb) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your order number and phone number.",
      });
    }

    // HIGH-3: Exclude sensitive PII (customer_name, customer_phone, customer_email)
    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total_price: order.total_price,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        delivery_notes: order.delivery_notes,
        city: order.city,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items,
        delivery_slot_id: order.delivery_slot_id,
        deliverySlot: order.deliverySlot,
      },
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Fetch personal order receipts for the logged-in customer
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const DeliverySlot = require("../models/DeliverySlot");
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: DeliverySlot,
          as: "deliverySlot",
          attributes: ["id", "name", "start_time", "end_time"],
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
  let transaction;
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Order status parameter is required." });
    }

    transaction = await sequelize.transaction();

    const order = await Order.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== status) {
      const currentStatus = order.status;

      // CRIT-7: Enforce Order State Machine Transitions
      const VALID_TRANSITIONS = {
        pending: ["processing", "cancelled"],
        processing: ["assigned", "shipped", "cancelled"],
        assigned: ["out_for_delivery", "cancelled"],
        shipped: ["delivered", "cancelled"],
        out_for_delivery: ["delivered", "attempted", "failed"],
        delivered: ["completed"],
        completed: [],
        cancelled: [],
        attempted: ["out_for_delivery", "rescheduled", "cancelled"],
        rescheduled: ["out_for_delivery", "cancelled"],
        failed: ["pending", "cancelled"],
        returned: [],
      };

      const allowed = VALID_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(status)) {
        await transaction.rollback();
        return res.status(400).json({ error: `Invalid status transition from '${currentStatus}' to '${status}'.` });
      }

      // HIGH-1: Restore stock on cancellation
      if (status === "cancelled") {
        const items = await OrderItem.findAll({ where: { order_id: order.id }, transaction });
        for (const item of items) {
          const product = await Product.findByPk(item.product_id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          if (product) {
            product.stock += item.quantity;
            await product.save({ transaction });
          }
        }
      }

      order.status = status;
      if (!order.reviewed_at) {
        order.reviewed_at = new Date();
      }
      await order.save({ transaction });
    }

    await transaction.commit();

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
        console.error("Delivered email failed:", error.message);
      }
    }

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

/**
 * Admin / Staff Action: Mark order as reviewed
 */
exports.reviewOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    order.reviewed_at = new Date();
    await order.save();
    res.status(200).json({
      success: true,
      message: "Order marked as reviewed.",
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
    const DeliverySlot = require("../models/DeliverySlot");
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
        {
          model: DeliverySlot,
          as: "deliverySlot",
          attributes: ["id", "name", "start_time", "end_time"],
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
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    const orders = await Order.findAll({
      where,
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
    let netOrdersCount = 0;
    let uniqueUserIds = new Set();
    let orderStatusCounts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    let categorySalesMap = {};
    let dateSalesMap = {};

    orders.forEach((order) => {
      // Clean '$' symbol if formatted in getters
      const rawPrice = order.getDataValue("total_price");
      const orderTotal = typeof rawPrice === "string" ? parseFloat(rawPrice.replace(/([$]|qar|[\s,])/gi, "")) : parseFloat(rawPrice) || 0;
      
      let status = order.status || "pending";
      if (status === "completed") status = "delivered";
      if (orderStatusCounts[status] !== undefined) {
        orderStatusCounts[status]++;
      }

      // Senior Dev Accounting rule: exclude cancelled, failed, and returned orders from sales/revenue metrics
      const isRealizedRevenue = !["cancelled", "failed", "returned"].includes(order.status);
      if (isRealizedRevenue) {
        totalSales += orderTotal;
        netOrdersCount++;
        if (order.user_id) {
          uniqueUserIds.add(order.user_id);
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
      }
    });

    const totalCustomers = uniqueUserIds.size;
    const totalOrders = netOrdersCount;
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

    // MED-10: Password strength validation (min 6 chars)
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
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

/**
 * Bulk print orders: Mark orders as printed
 * PATCH /api/orders/bulk-print
 */
exports.bulkPrintOrders = async (req, res, next) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "orderIds array is required." });
    }

    // MED-6: Prevent overwriting printed_at for already-printed orders
    await Order.update(
      {
        is_printed: true,
        printed_at: sequelize.literal("COALESCE(printed_at, NOW())"),
      },
      {
        where: {
          id: {
            [Op.in]: orderIds,
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Orders marked as printed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export orders as CSV or Excel
 * GET /api/orders/export
 */
exports.exportOrders = async (req, res, next) => {
  try {
    const { startDate, endDate, status, printStatus, format } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (printStatus && printStatus !== "all") {
      if (printStatus === "printed") {
        where.is_printed = true;
      } else if (printStatus === "unprinted") {
        where.is_printed = false;
      }
    }

    const DeliverySlot = require("../models/DeliverySlot");
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: DeliverySlot,
          as: "deliverySlot",
          attributes: ["id", "name", "start_time", "end_time"],
        },
        // LOW-3: Include order items and products in export query
        {
          model: OrderItem,
          as: "items",
          include: {
            model: Product,
            as: "product",
            attributes: ["title"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const exportData = orders.map((o) => ({
      "Order Number": o.order_number || `ORD-${String(o.id).padStart(4, "0")}`,
      "Order Date": new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      "Customer Name": o.customer_name || "N/A",
      "Phone Number": o.customer_phone || "N/A",
      "Status": o.status,
      "Delivery Slot": o.deliverySlot ? o.deliverySlot.name : "N/A",
      "Total Amount": o.total_price || "—",
      "Payment Method": o.payment_method || "COD",
      "Address": o.shipping_address,
      // LOW-3: Format ordered items list
      "Items Ordered": o.items && o.items.length > 0
        ? o.items.map((item) => `${item.product ? item.product.title : "Unknown Product"} (x${item.quantity})`).join(", ")
        : "N/A",
      "Created Date": o.createdAt,
    }));

    const XLSX = require("xlsx");
    if (format === "csv") {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=orders_export_${Date.now()}.csv`);
      return res.send(csvContent);
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=orders_export_${Date.now()}.xlsx`);
      return res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};

// MED-7: Customer self-cancellation endpoint (allows pending order cancellation)
exports.cancelMyOrder = async (req, res, next) => {
  let transaction;
  try {
    const { id } = req.params;
    const userId = req.user.id;

    transaction = await sequelize.transaction();

    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "pending") {
      await transaction.rollback();
      return res.status(400).json({ error: "Only pending orders can be cancelled." });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction });
      }
    }

    order.status = "cancelled";
    await order.save({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    next(error);
  }
};

