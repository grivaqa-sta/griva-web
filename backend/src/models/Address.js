// src/models/Address.js

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    label: {
      type: DataTypes.ENUM("home", "office", "other"),
      defaultValue: "home",
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Qatar-specific address fields
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    street: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    building_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    villa_apartment: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    floor: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    landmark: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    zone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Doha",
    },

    country: {
      type: DataTypes.STRING,
      defaultValue: "Qatar",
    },

    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
  }
);

Address.associate = (models) => {
  Address.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

module.exports = Address;