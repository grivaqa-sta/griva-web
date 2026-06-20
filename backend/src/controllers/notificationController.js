const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * Admin action: Send a notification message to drivers
 * POST /api/delivery/admin/notifications
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { driverId, title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required parameters.",
      });
    }

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "driverId is required ('all' or a specific driver user ID).",
      });
    }

    if (driverId === "all") {
      // Find all active/inactive delivery agents
      const drivers = await User.findAll({ where: { role: "delivery" } });
      
      if (drivers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No delivery drivers found to notify.",
        });
      }

      // Create notification records for all drivers in bulk/parallel
      const notifications = drivers.map((driver) => ({
        userId: driver.id,
        title,
        message,
        isRead: false,
      }));

      await Notification.bulkCreate(notifications);

      return res.status(201).json({
        success: true,
        message: `Notification broadcast sent successfully to all ${drivers.length} drivers.`,
      });
    } else {
      // Verify single driver exists and has delivery role
      const driver = await User.findOne({
        where: { id: driverId, role: "delivery" },
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Specified delivery driver not found.",
        });
      }

      const notification = await Notification.create({
        userId: driver.id,
        title,
        message,
        isRead: false,
      });

      return res.status(201).json({
        success: true,
        message: `Notification sent successfully to driver: ${driver.name}.`,
        notification,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Driver action: Retrieve notifications for the logged-in driver
 * GET /api/delivery/notifications
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId: driverId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver action: Mark a notification as read
 * PATCH /api/delivery/notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: driverId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver action: Clear all notifications
 * DELETE /api/delivery/notifications/clear-all
 */
exports.clearNotifications = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    await Notification.destroy({
      where: { userId: driverId },
    });

    res.status(200).json({
      success: true,
      message: "All notifications cleared successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver action: Delete a single notification
 * DELETE /api/delivery/notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: driverId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
