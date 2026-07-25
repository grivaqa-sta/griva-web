const Address = require("../models/Address");
const handleApiError = require("../utils/errorHandler");

/**
 * Whitelist of fields a user is allowed to set on an address.
 * Prevents mass-assignment of internal fields like userId or id.
 */
const ALLOWED_ADDRESS_FIELDS = [
  "label", "fullName", "mobile", "area", "street",
  "building_number", "villa_apartment", "floor", "landmark",
  "zone", "city", "country", "isDefault", "latitude", "longitude",
];

const pickAllowedFields = (body) => {
  const sanitized = {};
  for (const key of ALLOWED_ADDRESS_FIELDS) {
    if (body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }
  return sanitized;
};

/**
 * Create Address
 */
exports.createAddress = async (req, res) => {
  try {
    const safeFields = pickAllowedFields(req.body);
    
    if (!safeFields.fullName || typeof safeFields.fullName !== "string" || !safeFields.fullName.trim()) {
      const err = new Error("Full name is required");
      err.statusCode = 400;
      throw err;
    }

    if (!safeFields.mobile || typeof safeFields.mobile !== "string" || !safeFields.mobile.trim()) {
      const err = new Error("Mobile number is required");
      err.statusCode = 400;
      throw err;
    }

    const address = await Address.create({
      ...safeFields,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.createAddress");
  }
};

/**
 * Get All Addresses
 */
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: {
        userId: req.user.id,
      },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.getAddresses");
  }
};

/**
 * Get Single Address
 */
exports.getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid address ID");
      err.statusCode = 400;
      throw err;
    }

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      const err = new Error("Address not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.getAddress");
  }
};

/**
 * Update Address
 */
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid address ID");
      err.statusCode = 400;
      throw err;
    }

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      const err = new Error("Address not found");
      err.statusCode = 404;
      throw err;
    }

    await address.update(pickAllowedFields(req.body));

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.updateAddress");
  }
};

/**
 * Delete Address
 */
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid address ID");
      err.statusCode = 400;
      throw err;
    }

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      const err = new Error("Address not found");
      err.statusCode = 404;
      throw err;
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.deleteAddress");
  }
};

/**
 * Set Default Address
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid address ID");
      err.statusCode = 400;
      throw err;
    }

    const address = await Address.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      const err = new Error("Address not found");
      err.statusCode = 404;
      throw err;
    }

    await Address.update(
      { isDefault: false },
      {
        where: {
          userId: req.user.id,
        },
      }
    );

    await address.update({
      isDefault: true,
    });

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    return handleApiError(error, req, res, "AddressController.setDefaultAddress");
  }
};