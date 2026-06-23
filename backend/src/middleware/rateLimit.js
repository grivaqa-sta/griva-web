const rateLimit = require("express-rate-limit");
const path = require("path");

// Ensure environment variables are loaded if this file is required directly or before server.js loads them
if (!process.env.NODE_ENV) {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}

// Dynamic bypass helper
const shouldBypass = (req) => {
  // 1. Check environment variable
  const env = (process.env.NODE_ENV || "development").toLowerCase();
  if (env === "development" || env === "dev" || env === "test") {
    return true;
  }

  // 2. Check request host and IP if request object is available
  if (req) {
    const host = req.headers.host || "";
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || "";
    if (
      host.includes("localhost") || 
      host.includes("127.0.0.1") || 
      host.includes("::1") ||
      ip.includes("127.0.0.1") || 
      ip.includes("::1") || 
      ip.includes("::ffff:127.0.0.1")
    ) {
      return true;
    }
  }

  return false;
};

const actualApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Limit each IP to 1500 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

const actualStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
});

// Middleware wrappers
const apiLimiter = (req, res, next) => {
  if (shouldBypass(req)) {
    return next();
  }
  return actualApiLimiter(req, res, next);
};

const strictLimiter = (req, res, next) => {
  if (shouldBypass(req)) {
    return next();
  }
  return actualStrictLimiter(req, res, next);
};

module.exports = {
  apiLimiter,
  strictLimiter,
};