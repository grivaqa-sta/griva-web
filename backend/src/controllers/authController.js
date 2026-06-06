/**
 * AUTHENTICATION CONTROLLER (authController.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, this is equivalent to your AuthenticationService or 
 * AuthController class.
 * Spring maps requests using @PostMapping("/login") and relies on `AuthenticationManager` 
 * to validate user credentials. 
 * In Node.js, we write simple async functions that query the Sequelize models, 
 * validate inputs, and return responses manually.
 * 
 * ─── SUPABASE COMPARISON ──────────────────────────────────────────────────────
 * Supabase triggers `auth.signUp()` and handles session caching in the client SDK. 
 * In our custom API, we manually generate and return JWTs using `jsonwebtoken` on login success.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Provides user register/login interfaces for custom e-commerce profiles. Securely hashes 
 * passwords and issues access credentials containing expiration parameters.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without controllers, the API cannot handle authorization logic, leaving the application 
 * unable to authenticate users or authorize administrators.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always issue JWTs with an expiration date (e.g. 7 days).
 * Use generic messages (like "Invalid credentials") for login failures so malicious 
 * actors cannot guess if an email address exists in your database.
 */

const User = require("../models/User");
const jwt = require("jsonwebtoken");

// JWT token helper (JPA TokenProvider equivalent)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "default_jwt_fallback_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Customer / Admin Registration Handler
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password parameters are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email address already exists." });
    }

    // Create user (triggers Sequelize pre-save password hashing hook automatically)
    const user = await User.create({ email, password, role: role || "customer" });

    // Exclude password from return payload
    const userJson = user.toJSON();
    delete userJson.password;

    const token = generateToken(user);

    res.status(201).json({
      message: "Account registered successfully.",
      token,
      user: userJson,
    });
  } catch (error) {
    next(error); // Passes execution to Express's global error handler middleware
  }
};

/**
 * Customer / Admin Login Handler
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password parameters are required." });
    }

    // Query database. Note the scope 'withPassword' is used to override the default exclude scope.
    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password credentials." });
    }

    // Compare input password with hashed database column
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password credentials." });
    }

    const token = generateToken(user);

    // Convert model instance to plain JS object to safely delete password before outputting
    const userJson = user.toJSON();
    delete userJson.password;

    res.status(200).json({
      message: "Login successful.",
      token,
      user: userJson,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Session Profile Handler
 */
exports.getProfile = async (req, res, next) => {
  try {
    // req.user was populated by authenticateJWT middleware
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User session profile not found." });
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
