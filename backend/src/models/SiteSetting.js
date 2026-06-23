const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SiteSetting = sequelize.define(
  "SiteSetting",
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
    announcementBarText: {
      type: DataTypes.STRING,
      defaultValue: "Free shipping across Doha for orders over QAR 150!",
    },
    fridaySaleEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    midnightSaleEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    siteLogoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      defaultValue: "+97455551234",
    },
    supportEmail: {
      type: DataTypes.STRING,
      defaultValue: "support@thegriva.com",
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 15.00,
    },
    freeShippingThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 150.00,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = SiteSetting;
