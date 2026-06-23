const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { authenticateJWT, authenticateOptionalJWT, isAdminOrStaff } = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", authenticateOptionalJWT, productController.getProducts);
router.get("/featured",productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/best-sellers",productController.getBestSellerProducts);
router.get("/new-arrivals",productController.getNewProducts);
router.get("/banner",productController.getBannerActiveProducts);
router.get("/subcategory/:subcategoryId", authenticateOptionalJWT, productController.getProductsBySubCategory);
router.get("/:id", authenticateOptionalJWT, productController.getProductById);



/**
 * Admin / Staff Routes
 */
router.post("/",authenticateJWT,isAdminOrStaff,productController.createProduct);
router.put("/:id",authenticateJWT,isAdminOrStaff,productController.updateProduct);
router.patch("/:id/stock",authenticateJWT,isAdminOrStaff,productController.updateProductStock);
router.delete("/:id",authenticateJWT,isAdminOrStaff,productController.deleteProduct);

//banner routes
router.patch("/:id/banner",authenticateJWT,isAdminOrStaff,productController.updateBannerStatus);


module.exports = router;