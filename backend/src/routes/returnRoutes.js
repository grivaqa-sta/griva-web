const express = require("express");
const router = express.Router();
const returnController = require("../controllers/returnController");
const { authenticateJWT, isAdminOrStaff } = require("../middleware/auth");
const { strictLimiter } = require("../middleware/rateLimit");

// ─────────────────────────────────────────────────────────
// Customer Authorized Routes (Requires valid JWT session)
// ─────────────────────────────────────────────────────────

// Maps to: POST /api/returns (Submit return request)
router.post("/", strictLimiter, authenticateJWT, returnController.submitReturnRequest);

// Maps to: GET /api/returns/my-returns (List customer's own return requests)
router.get("/my-returns", authenticateJWT, returnController.getMyReturns);

// ─────────────────────────────────────────────────────────
// Admin Authorized Routes (Requires valid JWT & Admin/Staff status)
// ─────────────────────────────────────────────────────────

// Maps to: GET /api/returns (List all return requests)
router.get("/", authenticateJWT, isAdminOrStaff, returnController.getAllReturns);

// Maps to: PATCH /api/returns/:id/status (Approve or reject a return request)
router.patch("/:id/status", authenticateJWT, isAdminOrStaff, returnController.updateReturnRequestStatus);

module.exports = router;
