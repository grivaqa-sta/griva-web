const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const {authenticateJWT,isAdminOrStaff} = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", categoryController.getAllCategories);
router.get("/active", categoryController.getAllActiveCategories);
router.get("/with-subcategories",categoryController.getAllCategoriesWithSubcategories);
router.get("/:id", categoryController.getCategoryById);


/**
 * Admin / Staff Routes
 */
router.post("/",authenticateJWT,isAdminOrStaff,categoryController.createCategory);
router.put("/:id",authenticateJWT,isAdminOrStaff,categoryController.updateCategory);
router.delete("/:id",authenticateJWT,isAdminOrStaff,categoryController.deleteCategory);

module.exports = router;