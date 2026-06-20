const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * Public Routes
 */
router.get("/", productController.getProducts);
router.get("/featured",productController.getFeaturedProducts);
router.get("/trending", productController.getTrendingProducts);
router.get("/best-sellers",productController.getBestSellerProducts);
router.get("/new-arrivals",productController.getNewProducts);
router.get("/banner",productController.getBannerActiveProducts);
router.get("/subcategory/:subcategoryId",productController.getProductsBySubCategory);
router.get("/:id", productController.getProductById);


/**
 * Admin Routes
 */
router.post("/",authenticateJWT,isAdmin,productController.createProduct);
router.put("/:id",authenticateJWT,isAdmin,productController.updateProduct);
router.patch("/:id/stock",authenticateJWT,isAdmin,productController.updateProductStock);
router.delete("/:id",authenticateJWT,isAdmin,productController.deleteProduct);

//banner routes
router.patch("/:id/banner",authenticateJWT,isAdmin,productController.updateBannerStatus);

module.exports = router;