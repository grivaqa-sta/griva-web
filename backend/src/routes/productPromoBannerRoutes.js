const express = require("express");
const router = express.Router();

const productPromoBannerController = require("../controllers/productPromoBannerController");

const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * Public APIs
 */
router.get("/", productPromoBannerController.getAllBanners);
router.get("/active",productPromoBannerController.getActiveBanners);
router.get("/:id",productPromoBannerController.getBannerById);

/**
 * Admin Only APIs
 */
router.post("/",authenticateJWT,isAdmin,productPromoBannerController.createBanner);
router.put("/:id",authenticateJWT,isAdmin,productPromoBannerController.updateBanner);
router.patch("/:id/status",authenticateJWT,isAdmin,productPromoBannerController.updateBannerStatus);
router.delete("/:id",authenticateJWT,isAdmin,productPromoBannerController.deleteBanner);

module.exports = router;