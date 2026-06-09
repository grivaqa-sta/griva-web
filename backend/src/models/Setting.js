/**
 * SETTING MODEL (Setting.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to a global properties Entity. Stores system-wide configuration states.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Retains e-commerce Friday sales flags and system notification states. Persisting 
 * these in the database makes changes instantly visible to all storefront visitors.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Setting = sequelize.define(
  "Setting",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    announcementBarEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fridaySaleEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    midnightSaleEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Setting;
