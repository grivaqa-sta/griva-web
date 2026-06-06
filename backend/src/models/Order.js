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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "shipped", "completed", "cancelled"]],
      },
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("total_price");
        return rawValue ? `$${rawValue}` : null;
      },
      set(val) {
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/[$,]/g, "")) : val;
        this.setDataValue("total_price", cleanedVal);
      },
    },
    shipping_address: {
      type: DataTypes.TEXT,
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

module.exports = Order;
