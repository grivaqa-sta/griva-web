const jwt = require("jsonwebtoken");
const User = require("../models/User");

 // Verify JWT Token
const authenticateJWT = async (req, res, next) => {
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

    // Check if user has been blocked in the database
    const user = await User.findByPk(decoded.id, { attributes: ["status"] });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact customer support.",
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

 // Optional JWT Verification
 // Supports guest checkout + logged-in users
const authenticateOptionalJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // If token belongs to a blocked user, reject checkout immediately
      const user = await User.findByPk(decoded.id, { attributes: ["status"] });
      if (user && user.status === "BLOCKED") {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked. Please contact customer support.",
        });
      }

      req.user = decoded;
    } catch (error) {
       req.user = null;
    }
  }
  next();
};

// Admin Authorization
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message:
      "Admin privileges are required.",
  });
};

// Admin or Staff Authorization
const isAdminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "staff")) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin or Staff privileges are required.",
  });
};

module.exports = {
  authenticateJWT,
  authenticateOptionalJWT,
  isAdmin,
  isAdminOrStaff,
};