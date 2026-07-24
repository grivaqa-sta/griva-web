const User = require("../models/User");
const Order = require("../models/Order");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/brevoService");
const handleApiError = require("../utils/errorHandler");

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Register User
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      const err = new Error("Name is required.");
      err.statusCode = 400;
      throw err;
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      const err = new Error("Email is required.");
      err.statusCode = 400;
      throw err;
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      const err = new Error("Password is required and must be at least 6 characters.");
      err.statusCode = 400;
      throw err;
    }

    // Check existing user
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      const err = new Error("Email already exists.");
      err.statusCode = 409;
      throw err;
    }

    // Create customer account
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "customer",
    });

    const token = generateToken(user);

    // Account Linking: link guest orders by matching phone or email
    try {
      const linkedCount = await Order.update(
        { user_id: user.id },
        {
          where: {
            user_id: null,
            [Op.or]: [
              ...(email ? [{ customer_email: email.toLowerCase().trim() }] : []),
            ],
          },
        }
      );
      if (linkedCount[0] > 0) {
        console.log(`✅ Linked ${linkedCount[0]} guest order(s) to new user ${user.id}`);
      }
    } catch (linkError) {
      console.error("⚠️ Guest order linking failed:", linkError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.register");
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      const err = new Error("Email and password are required.");
      err.statusCode = 400;
      throw err;
    }

    // Get user including password
    const user = await User.scope("withPassword").findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      const err = new Error("Invalid credentials.");
      err.statusCode = 401;
      throw err;
    }

    if (user.status === "BLOCKED") {
      const err = new Error("Your account has been blocked. Please contact customer support.");
      err.statusCode = 403;
      throw err;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const err = new Error("Invalid credentials.");
      err.statusCode = 401;
      throw err;
    }

    const token = generateToken(user);

    // Remove password from response
    const userData = user.toJSON();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.login");
  }
};

/**
 * Get Logged In User Profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.getProfile");
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, isAdminRequest } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      const err = new Error("Email is required.");
      err.statusCode = 400;
      throw err;
    }

    const genericResponse = {
      success: true,
      message: "If that email is registered, a password reset link has been sent.",
    };

    const user = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      if (isAdminRequest) {
        const err = new Error("This email is not registered as an administrator or staff member.");
        err.statusCode = 403;
        throw err;
      }
      return res.status(200).json(genericResponse);
    }

    if (isAdminRequest && user.role !== "admin" && user.role !== "staff") {
      const err = new Error("This email is not registered as an administrator or staff member.");
      err.statusCode = 403;
      throw err;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpire,
    });

    let resetUrl;
    const frontendUrl = process.env.FRONTEND_URL || "https://thegriva.com";
    if (user.role === "customer") {
      resetUrl = `${frontendUrl}/auth/reset-password/${resetToken}`;
    } else {
      resetUrl = `${frontendUrl}/admin/auth/reset-password/${resetToken}`;
    }
    
    console.log("Reset URL:", resetUrl);

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr.message);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.forgotPassword");
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      const err = new Error("Token is required.");
      err.statusCode = 400;
      throw err;
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      const err = new Error("Password is required and must be at least 6 characters.");
      err.statusCode = 400;
      throw err;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.scope("withPassword").findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    });

    if (!user) {
      const err = new Error("Invalid token.");
      err.statusCode = 400;
      throw err;
    }

    if (new Date(user.resetPasswordExpire) < new Date()) {
      const err = new Error("Token expired.");
      err.statusCode = 400;
      throw err;
    }

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      const err = new Error("New password cannot be the same as your current password.");
      err.statusCode = 400;
      throw err;
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.resetPassword");
  }
};

/**
 * Update Logged In User Profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      const err = new Error("User not found.");
      err.statusCode = 404;
      throw err;
    }

    const { name, phone } = req.body;
    
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        const err = new Error("Name cannot be empty.");
        err.statusCode = 400;
        throw err;
      }
      user.name = name.trim();
    }
    if (phone !== undefined) {
      user.phone = phone;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AuthController.updateProfile");
  }
};
