const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateJWT } = require("../middleware/auth");
const { strictLimiter } = require("../middleware/rateLimit");

// Public endpoints (Accessible by anyone)
// Maps to: POST /api/auth/register
router.post("/register", strictLimiter, authController.register);

// Maps to: POST /api/auth/login
router.post("/login", strictLimiter, authController.login);

// Private endpoint (Intercepted by JWT validation check before calling profile fetcher)
// Maps to: GET /api/auth/profile
router.get("/profile", authenticateJWT, authController.getProfile);

// Maps to: POST /api/auth/forgot-password
router.post("/forgot-password", authController.forgotPassword);

// Maps to: PUT /api/auth/reset-password/:token
router.put("/reset-password/:token", authController.resetPassword);

module.exports = router;
