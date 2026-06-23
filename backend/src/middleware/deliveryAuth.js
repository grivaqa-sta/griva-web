// FEATURE: Delivery Boy System
// Created: 2026-06-18
// Do not modify without checking delivery feature docs

const jwt = require("jsonwebtoken");

/**
 * Verify JWT token and check user role === 'delivery'
 * Same pattern as existing auth.js middleware
 */
const authenticateDelivery = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token is required.",
    });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "delivery") {
      return res.status(403).json({
        success: false,
        message: "Not authorized as delivery staff.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = { authenticateDelivery };
