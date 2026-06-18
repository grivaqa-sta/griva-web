const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

//Create Category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
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
