const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const FlashSale = require("./FlashSale");
const Product = require("./Product");

const FlashSaleProduct = sequelize.define(
  "FlashSaleProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    flash_sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: FlashSale,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    flash_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("flash_price");
        if (!rawValue) return null;
        const cleaned = typeof rawValue === "string" ? rawValue.replace(/([$]|qar|[\s,])/gi, "") : rawValue;
        return `QAR ${parseFloat(cleaned).toFixed(2)}`;
      },
      set(val) {
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/([$]|qar|[\s,])/gi, "")) : val;
        this.setDataValue("flash_price", cleanedVal);
      },
    },
    flash_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Establish database relationship mappings
FlashSaleProduct.belongsTo(FlashSale, { foreignKey: "flash_sale_id", as: "flashSale" });
FlashSale.hasMany(FlashSaleProduct, { foreignKey: "flash_sale_id", as: "campaignProducts", onDelete: "CASCADE" });

FlashSaleProduct.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(FlashSaleProduct, { foreignKey: "product_id", as: "flashSales", onDelete: "CASCADE" });

module.exports = FlashSaleProduct;
