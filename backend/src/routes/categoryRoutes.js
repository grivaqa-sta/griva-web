const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const {authenticateJWT,isAdmin} = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", categoryController.getAllCategories);
router.get("/with-subcategories",categoryController.getAllCategoriesWithSubcategories);
router.get("/:id", categoryController.getCategoryById);


/**
 * Admin Routes
 */
router.post("/",authenticateJWT,isAdmin,categoryController.createCategory);
router.put("/:id",authenticateJWT,isAdmin,categoryController.updateCategory);
router.delete("/:id",authenticateJWT,isAdmin,categoryController.deleteCategory);

module.exports = router;