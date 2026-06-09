/**
 * SETTING CONTROLLER (settingController.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * Equivalent to a configuration properties RestController in Spring Boot.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * Manages active Friday sales campaigns, midnight discounts, and store announcement bars.
 */

const Setting = require("../models/Setting");

/**
 * Load global configurations
 */
exports.getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      // Create default if none exists
      setting = await Setting.create({
        announcementBarEnabled: true,
        fridaySaleEnabled: true,
        midnightSaleEnabled: false,
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
    const { announcementBarEnabled, fridaySaleEnabled, midnightSaleEnabled } = req.body;
    
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        announcementBarEnabled: announcementBarEnabled !== undefined ? announcementBarEnabled : true,
        fridaySaleEnabled: fridaySaleEnabled !== undefined ? fridaySaleEnabled : true,
        midnightSaleEnabled: midnightSaleEnabled !== undefined ? midnightSaleEnabled : false,
      });
    } else {
      if (announcementBarEnabled !== undefined) setting.announcementBarEnabled = announcementBarEnabled;
      if (fridaySaleEnabled !== undefined) setting.fridaySaleEnabled = fridaySaleEnabled;
      if (midnightSaleEnabled !== undefined) setting.midnightSaleEnabled = midnightSaleEnabled;
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
