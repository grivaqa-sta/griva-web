const SiteSetting = require("../models/SiteSetting");

/**
 * Load global configurations
 */
exports.getSettings = async (req, res, next) => {
  try {
    let setting = await SiteSetting.findOne();
    if (!setting) {
      // Create default if none exists
      setting = await SiteSetting.create({
        announcementBarEnabled: true,
        announcementBarText: "Free shipping across Doha for orders over $150!",
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
        whatsappNumber: "+97455551234",
        supportEmail: "support@thegriva.com",
        shippingFee: 15.00,
        freeShippingThreshold: 150.00,
      });
    }
    res.status(200).json({ settings: setting });
  } catch (error) {
    next(error);
  }
};

/**
 * Update global configurations
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const {
      announcementBarEnabled,
      announcementBarText,
      fridaySaleEnabled,
      midnightSaleEnabled,
      whatsappNumber,
      supportEmail,
      shippingFee,
      freeShippingThreshold,
    } = req.body;
    
    let setting = await SiteSetting.findOne();
    if (!setting) {
      setting = await SiteSetting.create({
        announcementBarEnabled: announcementBarEnabled !== undefined ? announcementBarEnabled : true,
        announcementBarText: announcementBarText || "Free shipping across Doha for orders over $150!",
        fridaySaleEnabled: fridaySaleEnabled !== undefined ? fridaySaleEnabled : true,
        midnightSaleEnabled: midnightSaleEnabled !== undefined ? midnightSaleEnabled : false,
        whatsappNumber: whatsappNumber || "+97455551234",
        supportEmail: supportEmail || "support@thegriva.com",
        shippingFee: shippingFee !== undefined ? shippingFee : 15.00,
        freeShippingThreshold: freeShippingThreshold !== undefined ? freeShippingThreshold : 150.00,
      });
    } else {
      if (announcementBarEnabled !== undefined) setting.announcementBarEnabled = announcementBarEnabled;
      if (announcementBarText !== undefined) setting.announcementBarText = announcementBarText;
      if (fridaySaleEnabled !== undefined) setting.fridaySaleEnabled = fridaySaleEnabled;
      if (midnightSaleEnabled !== undefined) setting.midnightSaleEnabled = midnightSaleEnabled;
      if (whatsappNumber !== undefined) setting.whatsappNumber = whatsappNumber;
      if (supportEmail !== undefined) setting.supportEmail = supportEmail;
      if (shippingFee !== undefined) setting.shippingFee = shippingFee;
      if (freeShippingThreshold !== undefined) setting.freeShippingThreshold = freeShippingThreshold;
      await setting.save();
    }

    res.status(200).json({
      message: "Campaign configurations updated successfully.",
      settings: setting,
    });
  } catch (error) {
    next(error);
  }
};
