const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

/**
 * Create SubCategory
 */
exports.createSubCategory = async (req, res) => {
  try {
    const { category_id, title, slug, href, image_url, is_active } = req.body;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

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
      : `/category/${category.slug || 'category'}?sub=${generatedSlug}`;

    const subCategory = await SubCategory.create({
      category_id: Number(category_id),
      title: title.trim(),
      slug: generatedSlug,
      href: generatedHref,
      image_url: image_url || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("❌ [SUBCATEGORY CREATE ERROR]:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create subcategory",
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }
};

/**
 * Get All SubCategories
 */
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Active SubCategories
 */
exports.getAllActiveSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      where: {
        is_active: true,
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get SubCategory By Id
 */
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update SubCategory
 */
exports.updateSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    if (req.body.category_id) {
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    }

    await subCategory.update(req.body);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    console.error("❌ [SUBCATEGORY UPDATE ERROR]:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to update subcategory",
      errors: error.errors?.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }
};

/**
 * Delete SubCategory
 */
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByPk(req.params.id);

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    await subCategory.destroy();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get SubCategories By Category
 */
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      where: {
        category_id: req.params.categoryId,
      },
    });

    res.status(200).json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};