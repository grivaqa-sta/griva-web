/**
 * REVIEW MODEL (Review.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to Review Entity class in Spring Boot. Maps the relationships 
 * between User, Product, and Review using ORM mapping annotations.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Represents public.reviews table, linked to products and users via standard 
 * SQL constraints.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * In e-commerce, customer reviews build purchase confidence. We link reviews to 
 * verified purchase flags to distinguish authenticated buyers from generic feedback.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a separate review table, product ratings would be hardcoded numbers, 
 * preventing dynamic text reviews and custom verification markers.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Define database indexes on foreign keys (`product_id`) to accelerate query 
 * lookups when customer traffic loads product details pages.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Product = require("./Product");
const User = require("./User");

const Review = sequelize.define(
  "Review",
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
        model: Product,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5, // Restricts rating between 1 and 5 stars
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Set to true if shopper bought this item
    },
  },
  {
    timestamps: true,
  }
);

// Establish database relationship mappings (JPA @ManyToOne equivalents)
Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(Review, { foreignKey: "product_id", as: "reviews", onDelete: "CASCADE" });

Review.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });

module.exports = Review;
