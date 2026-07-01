const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const DealOfDay = require("./DealOfDay");
const DiscoverMore = require("./DiscoverMore");
const ProductPromoBanner = require("./ProductPromoBanner");

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

    mobile_ad_banner:{
      type: DataTypes.STRING,
      allowNull: true,
    },

    deal_of_day:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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

    attributes: {
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
    indexes: [
      {
        fields: ["is_active", "is_featured"],
      },
      {
        fields: ["is_active", "is_best_seller"],
      },
      {
        fields: ["is_active", "is_trending"],
      },
      {
        fields: ["is_active", "is_new"],
      },
      {
        fields: ["is_active", "deal_of_day"],
      },
      {
        fields: ["is_active", "is_banner"],
      },
      {
        fields: ["subcategory_id"],
      },
    ],
  },
);

Product.associate = (models) => {
  Product.belongsTo(models.SubCategory, {
    foreignKey: "subcategory_id",
    as: "subcategory",
  });

  Product.hasOne(models.DealOfDay, {
    foreignKey: "productId",
    as: "dealOfDay",
  });

  Product.hasMany(models.DiscoverMore, {
    foreignKey: "productId",
    as: "discoverMoreBanners",
  });

  Product.hasOne(models.ProductPromoBanner, {
    foreignKey: "productId",
    as: "promoBanner",
  });

  Product.hasMany(models.ProductVariant, {
    foreignKey: "product_id",
    as: "productVariants",
    onDelete: "CASCADE",
  });
};

module.exports = Product;
