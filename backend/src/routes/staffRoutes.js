const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Secure all staff management endpoints under admin authentication check
router.use(authenticateJWT);
router.use(isAdmin);

router.get("/", staffController.getStaff);
router.post("/", staffController.createStaff);
router.put("/:id", staffController.updateStaff);
router.patch("/:id/status", staffController.updateStaffStatus);
router.patch("/:id/reset-password", staffController.resetStaffPassword);

module.exports = router;
