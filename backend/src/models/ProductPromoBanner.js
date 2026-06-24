const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const ProductPromoBanner = sequelize.define(
  "ProductPromoBanner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "product_promo_banners",
    timestamps: true,
  }
);

ProductPromoBanner.associate = (models) => {
  ProductPromoBanner.belongsTo(models.Product, {
    foreignKey: "productId",
    as: "product",
  });
};



module.exports = ProductPromoBanner;