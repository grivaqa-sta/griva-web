const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    combination: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    old_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: true,
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
  }
);

ProductVariant.associate = (models) => {
  ProductVariant.belongsTo(models.Product, {
    foreignKey: "product_id",
    as: "product",
  });
};

module.exports = ProductVariant;
