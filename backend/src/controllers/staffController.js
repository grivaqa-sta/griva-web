const User = require("../models/User");
const { Op } = require("sequelize");

/**
 * Get all staff users
 * GET /api/admin/staff
 */
exports.getStaff = async (req, res, next) => {
  try {
    const staffMembers = await User.findAll({
      where: {
        role: "staff",
      },
      attributes: ["id", "name", "email", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      staff: staffMembers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new staff user
 * POST /api/admin/staff
 */
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    const newStaff = await User.create({
      name,
      email,
      password,
      role: "staff",
      status: "ACTIVE",
    });

    // Remove password from response
    const staffData = newStaff.toJSON();
    delete staffData.password;

    res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      staff: staffData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update staff details
 * PUT /api/admin/staff/:id
 */
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
        id: { [Op.ne]: id },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another user.",
      });
    }

    staff.name = name;
    staff.email = email;
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff account updated successfully.",
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        status: staff.status,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update staff active/blocked status
 * PATCH /api/admin/staff/:id/status
 */
exports.updateStaffStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "BLOCKED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'ACTIVE' or 'BLOCKED'.",
      });
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    staff.status = status;
    await staff.save();

    res.status(200).json({
      success: true,
      message: `Staff status updated to ${status} successfully.`,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        status: staff.status,
        createdAt: staff.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset staff password
 * PATCH /api/admin/staff/:id/reset-password
 */
exports.resetStaffPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is required and must be at least 6 characters long.",
      });
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found.",
      });
    }

    staff.password = password; // Will be hashed automatically by user model hooks
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
};
