/**
 * CART MODEL (Cart.js)
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Stores active carts for authenticated users, linking each user to exactly one cart.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });

module.exports = Cart;
