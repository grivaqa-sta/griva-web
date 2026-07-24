const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const cache = require("../utils/cache");

//Create Category
exports.createCategory = async (req, res) => {
  try {
    const { title, slug, href, image_url, mobile_image_url, is_active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const generatedSlug = (slug && slug.trim())
      ? slug.trim()
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const generatedHref = (href && href.trim())
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
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create category",
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }
};

//Get All Categories with out subcategories
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//Get Single Category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }
};

//Update Category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.update(req.body);
    cache.clear(); // Clear cache on update

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }
};

//Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.destroy();
    cache.clear(); // Clear cache on delete

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
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
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
