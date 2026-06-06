/**
 * AUTHENTICATION ROUTER (authRoutes.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, URL routing is handled inside the controller class by adding 
 * annotations directly on methods: `@PostMapping("/login")` or `@GetMapping("/profile")`.
 * In Node.js, routing is decoupled from controller classes. We use the Express 
 * `Router` module to map HTTP verbs and URL paths to specific middleware chains 
 * and controller functions.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Sets up routing rules for user accounts, connecting login, signup, and 
 * session fetching calls to the correct controller routines.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without routers, your server is unaware of what code to run when a browser sends 
 * requests to `/api/auth/login`.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Keep route declarations clean. Avoid putting inline business logic inside routers; 
 * only declare your middleware filters and point directly to the target controllers.
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateJWT } = require("../middleware/auth");

// Public endpoints (Accessible by anyone)
// Maps to: POST /api/auth/register
router.post("/register", authController.register);

// Maps to: POST /api/auth/login
router.post("/login", authController.login);

// Private endpoint (Intercepted by JWT validation check before calling profile fetcher)
// Maps to: GET /api/auth/profile
router.get("/profile", authenticateJWT, authController.getProfile);

module.exports = router;
