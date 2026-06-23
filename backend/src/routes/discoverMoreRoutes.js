const express = require("express");
const router = express.Router();

const discoverMoreController = require("../controllers/discoverMore.controller");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

router.get("/", discoverMoreController.getAllDiscoverMore);
router.get("/active", discoverMoreController.getActiveDiscoverMore);
router.get("/:id", discoverMoreController.getDiscoverMoreById);

router.post(
  "/",
  authenticateJWT,
  isAdmin,
  discoverMoreController.createDiscoverMore
);

router.put(
  "/:id",
  authenticateJWT,
  isAdmin,
  discoverMoreController.updateDiscoverMore
);

router.patch(
  "/:id/status",
  authenticateJWT,
  isAdmin,
  discoverMoreController.updateDiscoverMoreStatus
);

router.delete(
  "/:id",
  authenticateJWT,
  isAdmin,
  discoverMoreController.deleteDiscoverMore
);

module.exports = router;