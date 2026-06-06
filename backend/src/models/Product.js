/**
 * PRODUCT MODEL (Product.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, mapping dynamic fields (like list of specs or image arrays) 
 * requires complex Hibernate mappings: @OneToMany tables, @ElementCollection lists, 
 * or writing custom @Converter classes to serialize objects into single columns.
 * In Node.js + PostgreSQL, we declare these attributes simply as DataTypes.JSONB, 
 * allowing JavaScript objects to be written and read directly without relational boilerplate.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Directly maps to your public.products table. Supabase handles JSON fields 
 * natively on Postgres; in Sequelize, we map them directly using the JSONB data type.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Store dynamic specifications for varying product types (e.g. storage size options 
 * for mobile phones vs. audio frequencies for headphones) without altering the 
 * database table structure every time a new product type is added.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a schema model mapping variants/specs, you'd have to construct separate 
 * database tables for colors, specs, and storage values, forcing complex multi-table 
 * JOIN queries that degrade performance on cheap database tiers.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always use decimal data types for prices to prevent floating-point rounding bugs 
 * (never use floats for currency calculations).
 * We implement a custom Sequelize getter/setter to automatically strip currency symbols 
 * (like '$') when saving, returning them formatted to the frontend.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Category = require("./Category");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // 10 digits total, 2 after decimal. Safe for currency calculations.
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("price");
        return rawValue ? `$${rawValue}` : null; // Formats price for Next.js UI automatically
      },
      set(val) {
        // Strips '$' symbols automatically before writing decimal to Azure PostgreSQL
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/[$,]/g, "")) : val;
        this.setDataValue("price", cleanedVal);
      },
    },
    old_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("old_price");
        return rawValue ? `$${rawValue}` : null;
      },
      set(val) {
        if (!val) return this.setDataValue("old_price", null);
        const cleanedVal = typeof val === "string" ? parseFloat(val.replace(/[$,]/g, "")) : val;
        this.setDataValue("old_price", cleanedVal);
      },
    },
    badge: {
      type: DataTypes.STRING, // e.g. "-26%", "HOT", "NEW"
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // Dynamic e-commerce fields utilizing PostgreSQL JSONB columns
    specs: {
      type: DataTypes.JSONB, // Stores [{label: "RAM", value: "12GB"}, ...]
      allowNull: true,
      defaultValue: [],
    },
    colors: {
      type: DataTypes.JSONB, // Stores [{name: "Phantom Black", hex: "#1a1a1a"}, ...]
      allowNull: true,
      defaultValue: [],
    },
    storage_options: {
      type: DataTypes.JSONB, // Stores [{label: "256GB", value: "256gb"}, ...]
      allowNull: true,
      defaultValue: [],
    },
    main_image_url: {
      type: DataTypes.STRING,
      allowNull: false, // Uploaded to Cloudflare R2
    },
    gallery_image_urls: {
      type: DataTypes.JSONB, // Array of secondary image URLs
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
  }
);

// Establish database relationship mappings (JPA @ManyToOne/@OneToMany equivalents)
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

module.exports = Product;
