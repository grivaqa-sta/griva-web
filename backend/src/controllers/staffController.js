const User = require("../models/User");
const { Op } = require("sequelize");
const handleApiError = require("../utils/errorHandler");

/**
 * Get all staff users
 * GET /api/admin/staff
 */
exports.getStaff = async (req, res) => {
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
    return handleApiError(error, req, res, "StaffController.getStaff");
  }
};

/**
 * Create a new staff user
 * POST /api/admin/staff
 */
exports.createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingUser) {
      const err = new Error("Email is already registered.");
      err.statusCode = 409;
      throw err;
    }

    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "staff",
      status: "ACTIVE",
    });

    const staffData = newStaff.toJSON();
    delete staffData.password;

    res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      staff: staffData,
    });
  } catch (error) {
    return handleApiError(error, req, res, "StaffController.createStaff");
  }
};

/**
 * Update staff details
 * PUT /api/admin/staff/:id
 */
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid staff ID.");
      err.statusCode = 400;
      throw err;
    }

    if (!name || !email) {
      const err = new Error("Name and email are required.");
      err.statusCode = 400;
      throw err;
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      const err = new Error("Staff member not found.");
      err.statusCode = 404;
      throw err;
    }

    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim(),
        id: { [Op.ne]: id },
      },
    });

    if (existingUser) {
      const err = new Error("Email is already in use by another user.");
      err.statusCode = 409;
      throw err;
    }

    staff.name = name.trim();
    staff.email = email.toLowerCase().trim();
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
    return handleApiError(error, req, res, "StaffController.updateStaff");
  }
};

/**
 * Update staff active/blocked status
 * PATCH /api/admin/staff/:id/status
 */
exports.updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid staff ID.");
      err.statusCode = 400;
      throw err;
    }

    if (!status || !["ACTIVE", "BLOCKED"].includes(status)) {
      const err = new Error("Status must be 'ACTIVE' or 'BLOCKED'.");
      err.statusCode = 400;
      throw err;
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      const err = new Error("Staff member not found.");
      err.statusCode = 404;
      throw err;
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
    return handleApiError(error, req, res, "StaffController.updateStaffStatus");
  }
};

/**
 * Reset staff password
 * PATCH /api/admin/staff/:id/reset-password
 */
exports.resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid staff ID.");
      err.statusCode = 400;
      throw err;
    }

    if (!password || password.length < 6) {
      const err = new Error("Password is required and must be at least 6 characters long.");
      err.statusCode = 400;
      throw err;
    }

    const staff = await User.findOne({
      where: {
        id,
        role: "staff",
      },
    });

    if (!staff) {
      const err = new Error("Staff member not found.");
      err.statusCode = 404;
      throw err;
    }

    staff.password = password;
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff password reset successfully.",
    });
  } catch (error) {
    return handleApiError(error, req, res, "StaffController.resetStaffPassword");
  }
};
