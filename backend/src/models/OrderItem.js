/**
 * ORDER ITEM MODEL (OrderItem.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Maps to the child elements inside the JPA @OneToMany list in Order.java. 
 * Formulates the join table containing order details.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Maps to public.order_items database table, linking multiple products to a single order.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Stores product details at the exact moment of checkout. E-commerce platforms 
 * update product prices frequently. Storing `price_at_purchase` ensures that past 
 * receipts remain correct even if the current product price changes.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without an OrderItem table, you'd only be able to buy 1 type of product per order.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always save the variant attributes (`selected_color` and `selected_storage`) 
 * as static strings on this item, so warehouse staff know exactly which variant 
 * needs to be packed.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
      onDelete: "CASCADE", // Cascades deletions from parent Order
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    selected_color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    selected_storage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price_at_purchase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("price_at_purchase");
        return rawValue ? `$${rawValue}` : null;
      },
      set(val) {
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/[$,]/g, "")) : val;
        this.setDataValue("price_at_purchase", cleanedVal);
      },
    },
  },
  {
    timestamps: false, // Not needed since the parent Order tracks creation timestamps
  }
);

// Establish database relationship mappings (JPA cascade mappings)
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items", onDelete: "CASCADE" });

OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });

module.exports = OrderItem;
