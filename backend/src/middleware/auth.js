/**
 * AUTHENTICATION MIDDLEWARE (auth.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Security, this functions as your JWT request filter (e.g. JwtRequestFilter.java).
 * In Java, you extend `OncePerRequestFilter`, extract the token from headers, 
 * validate it, and register the authentication context into the security holder.
 * In Express, we write simple middleware functions that intercept requests (`req`), 
 * validate inputs, attach user data to `req.user`, and trigger `next()` to advance execution.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Supabase triggers Row Level Security (RLS) policies on PostgreSQL.
 * In a custom API, we validate the JWT at the server level, allowing us to implement 
 * fine-grained controller access checks.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Prevents unauthorized users from calling customer/admin API endpoints. For example, 
 * checkout requests and admin stock adjustments are blocked immediately if the 
 * authorization token is invalid.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without auth middlewares, your API endpoints are entirely public, meaning anyone 
 * could bypass authentication and delete products or place free orders via terminal curl requests.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always check for the `Bearer ` prefix case-sensitively before parsing to avoid format errors.
 * Keep admin validation logic entirely separate to prevent privilege escalation vulnerabilities.
 */

const jwt = require("jsonwebtoken");

/**
 * Main JWT Verification Middleware
 * Matches Java's UsernamePasswordAuthenticationToken filter chain phase
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verify header prefix (Standard RFC 6750 rule)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    // Verify token using JWT Secret placeholder (loaded from env)
    jwt.verify(token, process.env.JWT_SECRET || "default_jwt_fallback_secret", (err, decodedPayload) => {
      if (err) {
        return res.status(403).json({ error: "Access Forbidden. Invalid or expired token credentials." });
      }

      // Attach parsed user data directly to request context (JPA SecurityContext equivalent)
      req.user = decodedPayload;
      next(); // Continues execution to the controller route handler
    });
  } else {
    res.status(401).json({ error: "Unauthorized access. Authorization Bearer token is missing." });
  }
};

/**
 * Admin Access Authorization Guard
 * Matches Java's Spring Security @PreAuthorize("hasRole('ADMIN')") method check
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Authenticated user is an admin. Allow routing.
  } else {
    res.status(403).json({ error: "Access Forbidden. Admin privilege permissions are required." });
  }
};

module.exports = {
  authenticateJWT,
  isAdmin,
};
