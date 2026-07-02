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
    telegramLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    whatsappCommunityLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    fridaySaleConfig: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [
        {
          number: "01",
          title: "Gaming Gear",
          subtitle: "Up to 35% OFF",
          type: "category",
          slug: "gaming-store-qatar",
          discount: 35,
          image: "/images/gamejoysticnew.png"
        },
        {
          number: "02",
          title: "Premium Audio",
          subtitle: "Up to 40% OFF",
          type: "category",
          slug: "exclusive-offers",
          discount: 40,
          image: "/images/headphonenew.png"
        },
        {
          number: "03",
          title: "Smartwatches",
          subtitle: "Up to 30% OFF",
          type: "category",
          slug: "shop",
          discount: 30,
          image: "/images/iwatch.png"
        },
        {
          number: "04",
          title: "Speakers & More",
          subtitle: "Special Drops",
          type: "category",
          slug: "electronics-store-qatar",
          discount: 10,
          image: "/images/bspeaker.png"
        }
      ]
    },
  },
  {
    timestamps: true,
  }
);

module.exports = SiteSetting;
