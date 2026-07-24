const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const { Op } = require("sequelize");
const cache = require("../utils/cache");
const handleApiError = require("../utils/errorHandler");

/**
 * Helper to extract Cloudinary public ID from its URL
 */
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return null;
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;
    const pathAfterUpload = splitUrl[1];
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    return pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf("."));
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

/**
 * Create Product
 */
exports.createProduct = async (req, res) => {
  try {
    const { subcategory_id, title, price, main_image_url } = req.body;

    if (!subcategory_id || isNaN(Number(subcategory_id))) {
      const err = new Error("Valid subcategory_id is required");
      err.statusCode = 400;
      throw err;
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      const err = new Error("Product title is required");
      err.statusCode = 400;
      throw err;
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      const err = new Error("Valid non-negative price is required");
      err.statusCode = 400;
      throw err;
    }

    if (!main_image_url || typeof main_image_url !== "string" || !main_image_url.trim()) {
      const err = new Error("main_image_url is required");
      err.statusCode = 400;
      throw err;
    }

    const subCategory = await SubCategory.findByPk(subcategory_id);

    if (!subCategory) {
      const err = new Error("Subcategory not found");
      err.statusCode = 404;
      throw err;
    }

    const product = await Product.create(req.body);

    const ProductVariant = require("../models/ProductVariant");
    const { variants } = req.body;
    if (Array.isArray(variants) && variants.length > 0) {
      const variantsToCreate = variants.map(v => ({
        product_id: product.id,
        combination: v.combination,
        stock: v.stock || 0,
        sku: v.sku || null,
        price: v.price || null,
        old_price: v.old_price || null,
        images: v.images || []
      }));
      await ProductVariant.bulkCreate(variantsToCreate);
      
      const totalStock = variantsToCreate.reduce((sum, v) => sum + v.stock, 0);
      product.stock = totalStock;
      await product.save();
    }

    cache.clear();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.createProduct");
  }
};

/**
 * Get All Products
 */
exports.getProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice } = req.query;
    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");

    const cacheKey = `products_${search || ""}_${minPrice || ""}_${maxPrice || ""}_${isAdminOrStaffUser}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }

    const where = {};

    if (!isAdminOrStaffUser) {
      where.is_active = true;
    }

    if (search) {
      const escapedSearch = search.replace(/[%_]/g, "\\$&");
      where[Op.or] = [
        {
          title: {
            [Op.iLike]: `%${escapedSearch}%`,
          },
        },
        {
          description: {
            [Op.iLike]: `%${escapedSearch}%`,
          },
        },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice && !isNaN(Number(minPrice))) {
        where.price[Op.gte] = Number(minPrice);
      }

      if (maxPrice && !isNaN(Number(maxPrice))) {
        where.price[Op.lte] = Number(maxPrice);
      }
    }

    const products = await Product.findAll({
      where,
      order: [["id", "DESC"]],
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getProducts");
  }
};

/**
 * Get Product By ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      const err = new Error("Product identifier is required");
      err.statusCode = 400;
      throw err;
    }

    const isId = /^\d+$/.test(id);
    let product;
    const ProductVariant = require("../models/ProductVariant");
    const includeOption = [{ model: ProductVariant, as: "productVariants" }];

    if (isId) {
      product = await Product.findByPk(id, { include: includeOption });
    } else {
      product = await Product.findOne({ where: { slug: id }, include: includeOption });
    }

    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");
    if (!product || (!product.is_active && !isAdminOrStaffUser)) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getProductById");
  }
};

/**
 * Get Products By SubCategory
 */
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    if (!subcategoryId || isNaN(Number(subcategoryId))) {
      const err = new Error("Invalid subcategory ID");
      err.statusCode = 400;
      throw err;
    }

    const where = {
      subcategory_id: subcategoryId,
    };

    const isAdminOrStaffUser = req.user && (req.user.role === "admin" || req.user.role === "staff");
    if (!isAdminOrStaffUser) {
      where.is_active = true;
    }

    const products = await Product.findAll({
      where,
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getProductsBySubCategory");
  }
};

/**
 * Featured Products
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const cacheKey = "products_featured";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        is_featured: true,
        is_active: true,
      },
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getFeaturedProducts");
  }
};

/**
 * Trending Products
 */
exports.getTrendingProducts = async (req, res) => {
  try {
    const cacheKey = "products_trending";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        is_trending: true,
        is_active: true,
      },
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getTrendingProducts");
  }
};

/**
 * Best Seller Products
 */
exports.getBestSellerProducts = async (req, res) => {
  try {
    const cacheKey = "products_bestseller";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        is_best_seller: true,
        is_active: true,
      },
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getBestSellerProducts");
  }
};

/**
 * New Arrival Products
 */
exports.getNewProducts = async (req, res) => {
  try {
    const cacheKey = "products_newarrivals";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        is_new: true,
        is_active: true,
      },
      order: [["createdAt", "DESC"]],
      limit: 4,
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getNewProducts");
  }
};

/**
 * Update Product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    if (req.body.main_image_url && product.main_image_url && req.body.main_image_url !== product.main_image_url) {
      const oldPublicId = getPublicIdFromUrl(product.main_image_url);
      if (oldPublicId) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(oldPublicId).catch(err => {
          console.error("Failed to delete old image from Cloudinary:", err);
        });
      }
    }

    await product.update(req.body);

    const ProductVariant = require("../models/ProductVariant");
    const { variants, attributes } = req.body;
    
    const hasAttributes = (attributes && attributes.length > 0) || (product.attributes && product.attributes.length > 0);

    if (hasAttributes && Array.isArray(variants)) {
      const existingVariants = await ProductVariant.findAll({
        where: { product_id: product.id }
      });

      const payloadVariantIds = variants.filter(v => v.id).map(v => Number(v.id));
      
      for (const ev of existingVariants) {
        if (!payloadVariantIds.includes(ev.id)) {
          await ev.destroy();
        }
      }

      for (const v of variants) {
        if (v.id) {
          const ev = existingVariants.find(x => x.id === Number(v.id));
          if (ev) {
            await ev.update({
              combination: v.combination,
              stock: v.stock || 0,
              sku: v.sku || null,
              price: v.price || null,
              old_price: v.old_price || null,
              images: v.images || []
            });
          }
        } else {
          await ProductVariant.create({
            product_id: product.id,
            combination: v.combination,
            stock: v.stock || 0,
            sku: v.sku || null,
            price: v.price || null,
            old_price: v.old_price || null,
            images: v.images || []
          });
        }
      }

      const totalStock = await ProductVariant.sum("stock", {
        where: { product_id: product.id }
      }) || 0;
      product.stock = totalStock;
      await product.save();
    } else if (!hasAttributes) {
      await ProductVariant.destroy({ where: { product_id: product.id } });
    }

    cache.clear();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.updateProduct");
  }
};

/**
 * Update Stock
 */
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    if (stock === undefined || stock === null || isNaN(Number(stock)) || Number(stock) < 0) {
      const err = new Error("Valid non-negative stock quantity is required");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    const ProductVariant = require("../models/ProductVariant");
    const variantCount = await ProductVariant.count({ where: { product_id: product.id } });
    if (variantCount > 0) {
      const err = new Error("Stock of a variant-based product must be updated via variants.");
      err.statusCode = 400;
      throw err;
    }

    product.stock = Number(stock);

    await product.save();
    cache.clear();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      stock: product.stock,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.updateProductStock");
  }
};

/**
 * Delete Product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    if (product.main_image_url) {
      const publicId = getPublicIdFromUrl(product.main_image_url);
      if (publicId) {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(publicId).catch(err => {
          console.error("Failed to delete product image from Cloudinary:", err);
        });
      }
    }

    await product.destroy();
    cache.clear();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.deleteProduct");
  }
};

// Update Banner Status
exports.updateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    const { is_banner, href, tags, banner_background_color, mobile_ad_banner, desktop_ad_banner } = req.body;

    await product.update({
      is_banner,
      href,
      tags,
      banner_background_color,
      mobile_ad_banner,
      desktop_ad_banner
    });
    cache.clear();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      data: product,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.updateBannerStatus");
  }
};

// Get Banner Active Products
exports.getBannerActiveProducts = async (req, res) => {
  try {
    const cacheKey = "products_banner_active";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        is_banner: true,
        is_active: true,
      },
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getBannerActiveProducts");
  }
};

// Deal of the Day
exports.updateDealOfDay = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid product ID");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findByPk(id);

    if (!product) {
      const err = new Error("Product not found");
      err.statusCode = 404;
      throw err;
    }

    const { deal_of_day } = req.body;

    await product.update({
      deal_of_day
    });
    cache.clear();

    res.status(200).json({
      success: true,
      message: "deal of the day updated successfully",
      data: product,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.updateDealOfDay");
  }
};

// Get Deal of the Day Products
exports.getDealOfDayProducts = async (req, res) => {
  try {
    const cacheKey = "products_deal_of_day";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        count: cached.length,
        data: cached,
      });
    }

    const products = await Product.findAll({
      where: {
        deal_of_day: true,
        is_active: true,
      },
    });

    cache.set(cacheKey, products, 300000);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return handleApiError(error, req, res, "ProductController.getDealOfDayProducts");
  }
};
