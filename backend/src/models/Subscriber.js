/**
 * SUBSCRIBER MODEL (Subscriber.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to a newsletter subscriber Entity.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Stores active email lists of visitors who opted into marketing notifications.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Subscriber = sequelize.define(
  "Subscriber",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    joinedDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: "Qatar",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Subscriber;
