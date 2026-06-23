const rateLimit = require("express-rate-limit");
const path = require("path");

// Ensure environment variables are loaded if this file is required directly or before server.js loads them
if (!process.env.NODE_ENV) {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}

const isDev = process.env.NODE_ENV === "development";

console.log(`[RATE LIMIT INITIALIZATION] Environment NODE_ENV is "${process.env.NODE_ENV}". Rate limiting is ${isDev ? "DISABLED" : "ENABLED"}.`);

const apiLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 150, // Limit each IP to 150 requests per window
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false,
      message: {
        error: "Too many requests from this IP, please try again after 15 minutes.",
      },
    });

const strictLimiter = isDev
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 15, // Limit each IP to 15 requests per window (strict for order/auth)
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        error: "Too many attempts from this IP. Please try again after 15 minutes.",
      },
    });

module.exports = {
  apiLimiter,
  strictLimiter,
};
