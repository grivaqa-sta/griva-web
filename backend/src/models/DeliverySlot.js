const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DeliverySlot = sequelize.define(
  "DeliverySlot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "delivery_slots",
    timestamps: true,
  }
);

DeliverySlot.associate = (models) => {
  DeliverySlot.hasMany(models.Order, {
    foreignKey: "delivery_slot_id",
    as: "orders",
  });
};

module.exports = DeliverySlot;
