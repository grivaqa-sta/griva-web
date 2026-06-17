const Category = require("../models/Category");

exports.getCategories = async (req, res, next) => {
  try {
    const { tree } = req.query;
    let categories;
    if (tree === "true") {
      categories = await Category.findAll({
        where: { parent_id: null },
        include: [{ model: Category, as: "subcategories" }],
        order: [
          ["title", "ASC"],
          [{ model: Category, as: "subcategories" }, "title", "ASC"],
        ],
      });
    } else {
      categories = await Category.findAll({
        include: [{ model: Category, as: "parent" }],
        order: [["title", "ASC"]],
      });
    }
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [
        { model: Category, as: "parent" },
        { model: Category, as: "subcategories" }
      ]
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { title, href, image_url, parent_id } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Category title is required." });
    }

    const defaultHref = href || `/category/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    const category = await Category.create({
      title,
      href: defaultHref,
      image_url,
      parent_id: parent_id || null,
    });

    res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, href, image_url, banner_image_url, parent_id } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    if (title !== undefined) category.title = title;
    if (href !== undefined) category.href = href;
    if (image_url !== undefined) category.image_url = image_url;
    if (banner_image_url !== undefined) category.banner_image_url = banner_image_url;
    if (parent_id !== undefined) category.parent_id = parent_id || null;

    await category.save();

    res.status(200).json({
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    await category.destroy();

    res.status(200).json({
      message: "Category deleted successfully.",
      categoryId: id,
    });
  } catch (error) {
    next(error);
  }
};
