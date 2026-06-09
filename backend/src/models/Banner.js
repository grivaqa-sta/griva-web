/**
 * BANNER MODEL (Banner.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Maps banner details to a single table using type discriminator checks (JPA SingleTable inheritance).
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Controls active home banners and promotional slides dynamically from the database.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // "slide" or "offer"
      validate: {
        isIn: [["slide", "offer"]],
      },
    },
    badge: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bg: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    href: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "/shop",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Banner;
