const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashSaleController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

router.get("/active", flashSaleController.getActiveFlashSale);

router.get("/", authenticateJWT, isAdmin, flashSaleController.getFlashSales);
router.post("/", authenticateJWT, isAdmin, flashSaleController.createFlashSale);
router.put("/:id", authenticateJWT, isAdmin, flashSaleController.updateFlashSale);
router.delete("/:id", authenticateJWT, isAdmin, flashSaleController.deleteFlashSale);

router.post("/products", authenticateJWT, isAdmin, flashSaleController.addProductToFlashSale);
router.delete("/products/:id", authenticateJWT, isAdmin, flashSaleController.removeProductFromFlashSale);

module.exports = router;
