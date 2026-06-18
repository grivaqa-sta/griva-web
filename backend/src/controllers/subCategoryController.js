const SubCategory = require("../models/SubCategory");
const Category = require("../models/Category");

/**
 * Create SubCategory
 */
exports.createSubCategory = async (req, res) => {
  try {
    const { category_id } = req.body;

    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const subCategory = await SubCategory.create(req.body);

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
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

    await subCategory.update(req.body);

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
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