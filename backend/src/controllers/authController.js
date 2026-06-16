const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate JWT Token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
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
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Create customer account
    const user = await User.create({
      name,
      email,
      password,
      role: "customer",
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Get user including password
    const user = await User.scope("withPassword").findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
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
    next(error);
  }
};

/**
 * Get Logged In User Profile
 * GET /api/auth/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// This function is called when user clicks "Forgot Password" and submits their email
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpire,
    });
    let resetUrl;
    if(user.role === "customer"){
        resetUrl =`${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    }else{
        resetUrl =`${process.env.FRONTEND_URL}/admin/auth/reset-password/${resetToken}`;
    }
    
    console.log("Reset URL:", resetUrl);

    return res.status(200).json({
      success: true,
      message:
        "Password reset link generated.",
      resetUrl,
    });
  } catch (error) {
    next(error);
  }
};

// This function is called when user clicks the reset link in their email and submits new password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.scope("withPassword")
      .findOne({
        where: {
          resetPasswordToken: token,
        },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (
      new Date(user.resetPasswordExpire) <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Token expired.",
      });
    }

    user.password = password;

    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};
