const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealOfDay.controller");

const { authenticateJWT, isAdmin } = require("../middleware/auth");

/**
 * Public APIs
 */
router.get("/", dealController.getAllDeals);
router.get("/active", dealController.getActiveDealOfDay);

/**
 * Admin Only APIs
 */
router.post(
  "/",
  authenticateJWT,
  isAdmin,
  dealController.createDealOfDay
);

router.put(
  "/:id",
  authenticateJWT,
  isAdmin,
  dealController.updateDealOfDay
);

router.patch(
  "/:id/status",
  authenticateJWT,
  isAdmin,
  dealController.updateDealStatus
);

router.delete(
  "/:id",
  authenticateJWT,
  isAdmin,
  dealController.deleteDealOfDay
);

module.exports = router;