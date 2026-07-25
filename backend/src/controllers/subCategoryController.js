const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");
const handleApiError = require("../utils/errorHandler");

/**
 * Create SubCategory
 */
exports.createSubCategory = async (req, res) => {
  try {
    const { category_id, title, slug, href, image_url, is_active } = req.body;

    if (!category_id || isNaN(Number(category_id))) {
      const err = new Error("Category ID is required and must be valid");
      err.statusCode = 400;
      throw err;
    }

    const category = await Category.findByPk(category_id);

    if (!category) {
      const err = new Error("Category not found");
      err.statusCode = 404;
      throw err;
    }

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
    return handleApiError(error, req, res, "SubCategoryController.createSubCategory");
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
    return handleApiError(error, req, res, "SubCategoryController.getAllSubCategories");
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
    return handleApiError(error, req, res, "SubCategoryController.getAllActiveSubCategories");
  }
};

/**
 * Get SubCategory By Id
 */
exports.getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid subcategory ID");
      err.statusCode = 400;
      throw err;
    }

    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      const err = new Error("Subcategory not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubCategoryController.getSubCategoryById");
  }
};

/**
 * Update SubCategory
 */
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid subcategory ID");
      err.statusCode = 400;
      throw err;
    }

    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      const err = new Error("Subcategory not found");
      err.statusCode = 404;
      throw err;
    }

    if (req.body.category_id) {
      if (isNaN(Number(req.body.category_id))) {
        const err = new Error("Invalid category ID");
        err.statusCode = 400;
        throw err;
      }
      const category = await Category.findByPk(req.body.category_id);
      if (!category) {
        const err = new Error("Category not found");
        err.statusCode = 404;
        throw err;
      }
    }

    await subCategory.update(req.body);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubCategoryController.updateSubCategory");
  }
};

/**
 * Delete SubCategory
 */
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid subcategory ID");
      err.statusCode = 400;
      throw err;
    }

    const subCategory = await SubCategory.findByPk(id);

    if (!subCategory) {
      const err = new Error("Subcategory not found");
      err.statusCode = 404;
      throw err;
    }

    await subCategory.destroy();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubCategoryController.deleteSubCategory");
  }
};

/**
 * Get SubCategories By Category
 */
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId || isNaN(Number(categoryId))) {
      const err = new Error("Invalid category ID");
      err.statusCode = 400;
      throw err;
    }

    const subCategories = await SubCategory.findAll({
      where: {
        category_id: categoryId,
      },
    });

    res.status(200).json({
      success: true,
      data: subCategories,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubCategoryController.getSubCategoriesByCategory");
  }
};