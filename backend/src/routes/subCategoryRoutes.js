const express = require("express");
const router = express.Router();

const subCategoryController = require("../controllers/subCategoryController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", subCategoryController.getAllSubCategories);
router.get("/active", subCategoryController.getAllActiveSubCategories);
router.get("/:id", subCategoryController.getSubCategoryById);
router.get("/category/:categoryId",subCategoryController.getSubCategoriesByCategory);

/**
 * Admin Routes
 */
router.post(
  "/",
  authenticateJWT,
  isAdmin,
  subCategoryController.createSubCategory
);

router.put(
  "/:id",
  authenticateJWT,
  isAdmin,
  subCategoryController.updateSubCategory
);

router.delete(
  "/:id",
  authenticateJWT,
  isAdmin,
  subCategoryController.deleteSubCategory
);

module.exports = router;