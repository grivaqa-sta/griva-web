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

const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const { sequelize } = require("../config/db");

/**
 * Process Shopping Cart Checkout inside a Safe Database Transaction
 * Powers: Checkout cart submit on Frontend UI
 */
exports.createOrder = async (req, res, next) => {
  // Start explicit Sequelize database transaction (Spring @Transactional equivalent)
  const transaction = await sequelize.transaction();

  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id; // Populated by JWT authentication middleware

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart items list is missing or empty." });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping delivery address is required." });
    }

    let calculatedTotal = 0;
    const itemsToCreate = [];

    // Loop through cart items to validate prices, stock, and variants
    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ error: `Product ID ${item.id} not found.` });
      }

      // Check Inventory Stock limits
      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(409).json({ 
          error: `Insufficient stock for '${product.title}'. Only ${product.stock} units available.` 
        });
      }

      // Decrement stock limits (like typical warehouse operations)
      product.stock -= item.quantity;
      await product.save({ transaction });

      // Strip '$' prefix from price mapping before calculating order values
      const unitPrice = parseFloat(product.getDataValue("price"));
      calculatedTotal += unitPrice * item.quantity;

      // Add to bulk creation list
      itemsToCreate.push({
        product_id: product.id,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
        selected_storage: item.selectedStorage || null,
        price_at_purchase: unitPrice,
      });
    }

    // 1. Create the Parent Order entry
    const order = await Order.create({
      user_id: userId,
      total_price: calculatedTotal,
      shipping_address: shippingAddress,
      status: "pending",
    }, { transaction });

    // Map parent ID to all child items
    const finalizedItems = itemsToCreate.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    // 2. Bulk Create all Child Order Items (performance optimized)
    await OrderItem.bulkCreate(finalizedItems, { transaction });

    // Commit all changes to Azure PostgreSQL Doha region
    await transaction.commit();

    res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    // Rollback the transaction to restore previous state if any error occurs
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
