const User = require("../models/User");
const Order = require("../models/Order");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/brevoService");

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

    // Account Linking: link guest orders by matching phone or email
    try {
      const userPhone = user.email; // email is always present
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
      // Non-critical — log but don't fail registration
      console.error("⚠️ Guest order linking failed:", linkError.message);
    }

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

    if (user.status === "BLOCKED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact customer support.",
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
    const { email, isAdminRequest } = req.body;

    // Always return generic success to prevent user enumeration attacks
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
        return res.status(403).json({
          success: false,
          message: "This email is not registered as an administrator or staff member.",
        });
      }
      return res.status(200).json(genericResponse);
    }

    if (isAdminRequest && user.role !== "admin" && user.role !== "staff") {
      return res.status(403).json({
        success: false,
        message: "This email is not registered as an administrator or staff member.",
      });
    }

    // Generate raw token (sent to user via email) and hashed token (stored in DB)
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpire,
    });
    let resetUrl;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    if(user.role === "customer"){
        resetUrl =`${frontendUrl}/auth/reset-password/${resetToken}`;
    }else{
        resetUrl =`${frontendUrl}/admin/auth/reset-password/${resetToken}`;
    }
    
    console.log("Reset URL:", resetUrl);

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr.message);
      // We still return 200/success or return a warning in dev mode
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// This function is called when user clicks the reset link in their email and submits new password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the incoming token to compare against the stored hashed token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.scope("withPassword")
      .findOne({
        where: {
          resetPasswordToken: hashedToken,
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

    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
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

/**
 * Update Logged In User Profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const { name, phone } = req.body;
    
    if (name !== undefined) {
      user.name = name;
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
    next(error);
  }
};
