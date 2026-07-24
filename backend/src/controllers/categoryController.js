const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const cache = require("../utils/cache");
const handleApiError = require("../utils/errorHandler");

//Create Category
exports.createCategory = async (req, res) => {
  try {
    const { title, slug, href, image_url, mobile_image_url, is_active } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      const err = new Error("Title is required");
      err.statusCode = 400;
      throw err;
    }

    const generatedSlug = (slug && typeof slug === "string" && slug.trim())
      ? slug.trim()
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const generatedHref = (href && typeof href === "string" && href.trim())
      ? href.trim()
      : `/category/${generatedSlug}`;

    const category = await Category.create({
      title: title.trim(),
      slug: generatedSlug,
      href: generatedHref,
      image_url: image_url || null,
      mobile_image_url: mobile_image_url || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    cache.clear(); // Clear cache on change
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.createCategory");
  }
};

//Get All Categories without subcategories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.getAllCategories");
  }
};

//get all active category
exports.getAllActiveCategories = async (req, res) => {
  try {
    const cacheKey = "active_categories";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const categories = await Category.findAll({
      where: {
        is_active: true,
      },
      order: [["id", "ASC"]],
    });

    cache.set(cacheKey, categories, 300000); // Cache for 5 mins

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.getAllActiveCategories");
  }
};

//Get Single Category
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid category ID");
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findByPk(id);

    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.getCategoryById");
  }
};

//Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid category ID");
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findByPk(id);

    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    await category.update(req.body);
    cache.clear(); // Clear cache on update

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.updateCategory");
  }
};

//Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid category ID");
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findByPk(id);

    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

    await category.destroy();
    cache.clear(); // Clear cache on delete

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.deleteCategory");
  }
};

// Get All Categories with subcategories
exports.getAllCategoriesWithSubcategories = async (req, res) => {
  try {
    const cacheKey = "categories_with_subcategories";
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
      });
    }

    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
          as: "subcategories",
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });

    cache.set(cacheKey, categories, 300000); // Cache for 5 mins

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleApiError(error, req, res, "CategoryController.getAllCategoriesWithSubcategories");
  }
};
