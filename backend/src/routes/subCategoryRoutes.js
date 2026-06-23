const express = require("express");
const router = express.Router();

const subCategoryController = require("../controllers/subCategoryController");
const { authenticateJWT, isAdminOrStaff } = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", subCategoryController.getAllSubCategories);
router.get("/active", subCategoryController.getAllActiveSubCategories);
router.get("/:id", subCategoryController.getSubCategoryById);
router.get("/category/:categoryId",subCategoryController.getSubCategoriesByCategory);

/**
 * Admin / Staff Routes
 */
router.post(
  "/",
  authenticateJWT,
  isAdminOrStaff,
  subCategoryController.createSubCategory
);

router.put(
  "/:id",
  authenticateJWT,
  isAdminOrStaff,
  subCategoryController.updateSubCategory
);

router.delete(
  "/:id",
  authenticateJWT,
  isAdminOrStaff,
  subCategoryController.deleteSubCategory
);

module.exports = router;