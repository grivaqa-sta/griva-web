const SiteSetting = require("../models/SiteSetting");
const handleApiError = require("../utils/errorHandler");

/**
 * Load global configurations
 */
exports.getSettings = async (req, res) => {
  try {
    let setting = await SiteSetting.findOne();
    if (!setting) {
      setting = await SiteSetting.create({
        announcementBarEnabled: true,
        announcementBarText: "Free shipping across Doha for orders over $150!",
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
        whatsappNumber: "+97470066559",
        supportEmail: "info@thegriva.com",
        shippingFee: 15.00,
        freeShippingThreshold: 150.00,
        telegramLink: "",
        whatsappCommunityLink: "",
        fridaySaleConfig: null,
      });
    }
    res.status(200).json({ success: true, settings: setting });
  } catch (error) {
    return handleApiError(error, req, res, "SettingController.getSettings");
  }
};

/**
 * Update global configurations
 */
exports.updateSettings = async (req, res) => {
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
      telegramLink,
      whatsappCommunityLink,
      fridaySaleConfig,
    } = req.body;
    
    let setting = await SiteSetting.findOne();
    if (!setting) {
      setting = await SiteSetting.create({
        announcementBarEnabled: announcementBarEnabled !== undefined ? Boolean(announcementBarEnabled) : true,
        announcementBarText: announcementBarText || "Free shipping across Doha for orders over $150!",
        fridaySaleEnabled: fridaySaleEnabled !== undefined ? Boolean(fridaySaleEnabled) : true,
        midnightSaleEnabled: midnightSaleEnabled !== undefined ? Boolean(midnightSaleEnabled) : false,
        whatsappNumber: whatsappNumber || "+97470066559",
        supportEmail: supportEmail || "info@thegriva.com",
        shippingFee: shippingFee !== undefined ? Number(shippingFee) : 15.00,
        freeShippingThreshold: freeShippingThreshold !== undefined ? Number(freeShippingThreshold) : 150.00,
        telegramLink: telegramLink || "",
        whatsappCommunityLink: whatsappCommunityLink || "",
        fridaySaleConfig: fridaySaleConfig || null,
      });
    } else {
      if (announcementBarEnabled !== undefined) setting.announcementBarEnabled = Boolean(announcementBarEnabled);
      if (announcementBarText !== undefined) setting.announcementBarText = announcementBarText;
      if (fridaySaleEnabled !== undefined) setting.fridaySaleEnabled = Boolean(fridaySaleEnabled);
      if (midnightSaleEnabled !== undefined) setting.midnightSaleEnabled = Boolean(midnightSaleEnabled);
      if (whatsappNumber !== undefined) setting.whatsappNumber = whatsappNumber;
      if (supportEmail !== undefined) setting.supportEmail = supportEmail;
      if (shippingFee !== undefined) setting.shippingFee = Number(shippingFee);
      if (freeShippingThreshold !== undefined) setting.freeShippingThreshold = Number(freeShippingThreshold);
      if (telegramLink !== undefined) setting.telegramLink = telegramLink;
      if (whatsappCommunityLink !== undefined) setting.whatsappCommunityLink = whatsappCommunityLink;
      if (fridaySaleConfig !== undefined) setting.fridaySaleConfig = fridaySaleConfig;
      await setting.save();
    }

    res.status(200).json({
      success: true,
      message: "Campaign configurations updated successfully.",
      settings: setting,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SettingController.updateSettings");
  }
};
