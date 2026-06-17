const express = require("express");
const router = express.Router();

const addressController = require("../controllers/addressController");
const { authenticateJWT } = require("../middleware/auth");

router.use(authenticateJWT);

router.post("/", addressController.createAddress);
router.get("/", addressController.getAddresses);
router.get("/:id", addressController.getAddress);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

router.put("/:id/default",addressController.setDefaultAddress);

module.exports = router;