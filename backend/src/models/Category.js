/**
 * CATEGORY MODEL (Category.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to Category entity in Java Spring Boot.
 * We model simple static lookup classifications (like Games, Laptops, Mobile).
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * In Supabase, this is a table with standard columns, linked to products via 
 * a Foreign Key constraint in the schema builder.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Categorization is critical for search engine optimization (SEO) and e-commerce 
 * search filter structures, allowing fast routing classifications.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a dedicated category table, e-commerce products would rely on raw, 
 * unindexed text columns, leading to orthographic bugs (e.g. searching "Laptops" 
 * but missing items categorized as "Laptop").
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Pre-populate / seed this table with standard categories at database initialization 
 * time to guarantee layout consistency on your Next.js frontend header.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    href: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true, // Optional category icon/banner path
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Category;
