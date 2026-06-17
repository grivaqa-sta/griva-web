const Address = require("../models/Address");

/**
 * Create Address
 */
exports.createAddress = async (req, res) => {
  try {
    const address = await Address.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Address
 */
exports.getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Address
 */
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await address.update(req.body);

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Address
 */
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await address.destroy();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Set Default Address
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};