/**
 * PRODUCT CONTROLLER (productController.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, custom search filters are built using JPA Specifications, 
 * CriteriaBuilder, or @Query Native SQL annotations.
 * In Sequelize, we define queries using declarative Option objects, mapping inputs 
 * directly to database operators (e.g. `[Op.and]`, `[Op.iLike]`).
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Replaces queries like `supabase.from('products').select('*, category(*)').eq('id', productId)`.
 * Express controllers execute these lookups directly on the Azure Postgres database.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Powers the e-commerce search bar and filters, allowing users to find specific products 
 * based on category, rating, price limits, and keywords.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a product controller, the frontend cannot load dynamic inventories; 
 * product catalog items would remain statically hardcoded on the UI.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always validate user page indexes before running pagination database counts.
 * Implement soft limits on catalog requests to prevent malicious actors from querying 
 * all records at once (e.g. `limit=10000`), which degrades database memory limits.
 */

const Product = require("../models/Product");
const Category = require("../models/Category");
const Review = require("../models/Review");
const { Op } = require("sequelize");

/**
 * Fetch Product Catalog with Advanced Shop Filters
 * Powers: Shop Page search, category sidebar filters, price sliders, and sorting drop-downs.
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, maxPrice, minRating, sortBy } = req.query;

    const queryOptions = {
      where: {},
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "title"],
        },
      ],
      order: [],
    };

    // 1. Search Query filter (matches Java's CriteriaBuilder.like)
    if (search && search.trim() !== "") {
      queryOptions.where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } }, // Case-insensitive matching
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // 2. Category Title Filter
    if (category) {
      // Sequelize performs a JOIN query constraint
      queryOptions.include[0].where = {
        title: { [Op.iLike]: category },
      };
    }

    // 3. Price Filter (Maximum Cap)
    if (maxPrice) {
      queryOptions.where.price = {
        [Op.lte]: parseFloat(maxPrice), // Less than or equal operator
      };
    }

    // 4. Rating Filter (Minimum Cap)
    if (minRating) {
      queryOptions.where.rating = {
        [Op.gte]: parseInt(minRating), // Greater than or equal operator
      };
    }

    // 5. Sorting Options (JPA Sort equivalent)
    if (sortBy === "price-low-to-high") {
      queryOptions.order.push(["price", "ASC"]);
    } else if (sortBy === "price-high-to-low") {
      queryOptions.order.push(["price", "DESC"]);
    } else if (sortBy === "rating") {
      queryOptions.order.push(["rating", "DESC"]);
    } else {
      queryOptions.order.push(["id", "ASC"]); // Default fallback sorting
    }

    // Fetch from Azure PostgreSQL
    const products = await Product.findAll(queryOptions);

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch Single Product Details with associated Category and Reviews
 * Powers: Dynamic Product Details Page (/product/[id])
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { 
          model: Review, 
          as: "reviews",
          include: {
            association: "user",
            attributes: ["id", "email"], // Only load basic user identifiers
          }
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all static category lookups
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [["title", "ASC"]] });
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Action: Create New Catalog Product
 * Powers: Admin Panel dashboard
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      category_id,
      title,
      price,
      old_price,
      badge,
      description,
      stock,
      specs,
      colors,
      storage_options,
      main_image_url,
      gallery_image_urls,
    } = req.body;

    // Guard constraints (Java bean validations equivalent)
    if (!category_id || !title || !price || !main_image_url) {
      return res.status(400).json({ error: "Missing required product attributes." });
    }

    // Validate category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ error: "Invalid Category ID lookup." });
    }

    const product = await Product.create({
      category_id,
      title,
      price,
      old_price,
      badge,
      description,
      stock: stock || 0,
      specs: specs || [],
      colors: colors || [],
      storage_options: storage_options || [],
      main_image_url,
      gallery_image_urls: gallery_image_urls || [],
    });

    res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Action: Quick Stock Inventory Adjustment
 * Powers: Admin Panel Inventory tracking
 */
exports.updateProductStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({ error: "Invalid stock value." });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    product.stock = stock;
    await product.save();

    res.status(200).json({
      message: "Inventory stock updated successfully.",
      productId: product.id,
      stock: product.stock,
    });
  } catch (error) {
    next(error);
  }
};
