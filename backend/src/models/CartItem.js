/**
 * CART ITEM MODEL (CartItem.js)
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Stores product lines within a cart, including quantities, color/storage variants,
 * and snapshots of the product price at the time of entry.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Cart = require("./Cart");
const Product = require("./Product");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cart,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    selected_color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    selected_storage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price_snapshot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("price_snapshot");
        if (!rawValue) return null;
        const cleaned = typeof rawValue === "string" ? rawValue.replace(/([$]|qar|[\s,])/gi, "") : rawValue;
        return `QAR ${parseFloat(cleaned).toFixed(2)}`;
      },
      set(val) {
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/([$]|qar|[\s,])/gi, "")) : val;
        this.setDataValue("price_snapshot", cleanedVal);
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["cart_id", "product_id", "selected_color", "selected_storage"],
        name: "cart_item_variant_unique",
      },
    ],
  }
);

CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });
Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items", onDelete: "CASCADE" });

CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems", onDelete: "CASCADE" });

module.exports = CartItem;
