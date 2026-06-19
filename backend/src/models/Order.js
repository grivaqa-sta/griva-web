/**
 * ORDER MODEL (Order.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to Order Entity class in Spring Boot. Maps the parent side of 
 * a One-to-Many cascade relationship with OrderItems.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Maps to your public.orders table, tracking transaction headers and checkout states.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Tracks the overall status of customer transactions (pending, completed, shipped) 
 * and maps the total sales figures needed for the admin panel dashboard.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a distinct Order table, you couldn't trace historical sales, track shipment 
 * updates, or review customer purchase receipts.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always write orders and deduct product stock inside a single ACID Database Transaction. 
 * If stock deduction fails, the order must rollback entirely to prevent double-selling.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "processing", "assigned", "out_for_delivery", "shipped", "delivered", "completed", "cancelled", "attempted", "rescheduled", "failed", "returned"]],
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("total_price");
        if (!rawValue) return null;
        const cleaned = typeof rawValue === "string" ? rawValue.replace(/([$]|qar|[\s,])/gi, "") : rawValue;
        return `QAR ${parseFloat(cleaned).toFixed(2)}`;
      },
      set(val) {
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/([$]|qar|[\s,])/gi, "")) : val;
        this.setDataValue("total_price", cleanedVal);
      },
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "COD",
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "unpaid",
    },
    delivery_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // FEATURE: Delivery Boy System
    delivery_boy_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // FEATURE: Delivery Attempt Management and Order Reopen System
    delivery_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    attempt_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    failed_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reschedule_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reopened_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reopened_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reopen_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

// Mappings
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

// FEATURE: Delivery Boy System
Order.belongsTo(User, { foreignKey: "delivery_boy_id", as: "deliveryBoy" });

module.exports = Order;
