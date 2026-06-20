const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    subcategory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "sub_categories",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    short_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    old_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    discount_percentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    main_image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    gallery_images: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    variants: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    specifications: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },

    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },

    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_best_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_trending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_new: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    is_banner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    href:{
      type:DataTypes.STRING,
      allowNull:true
    },

    banner_background_color:{
      type:DataTypes.STRING,
      allowNull:true
    },

    meta_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    views_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  },
);

Product.associate = (models) => {
  Product.belongsTo(models.SubCategory, {
    foreignKey: "subcategory_id",
    as: "subcategory",
  });
};

module.exports = Product;
