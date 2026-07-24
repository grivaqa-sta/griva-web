const Notification = require("../models/Notification");
const User = require("../models/User");
const handleApiError = require("../utils/errorHandler");

/**
 * Admin action: Send a notification message to drivers
 * POST /api/delivery/admin/notifications
 */
exports.sendNotification = async (req, res) => {
  try {
    const { driverId, title, message } = req.body;

    if (!title || typeof title !== "string" || !title.trim() || !message || typeof message !== "string" || !message.trim()) {
      const err = new Error("Title and message are required parameters.");
      err.statusCode = 400;
      throw err;
    }

    if (!driverId) {
      const err = new Error("driverId is required ('all' or a specific driver user ID).");
      err.statusCode = 400;
      throw err;
    }

    if (driverId === "all") {
      const drivers = await User.findAll({ where: { role: "delivery" } });
      
      if (drivers.length === 0) {
        const err = new Error("No delivery drivers found to notify.");
        err.statusCode = 404;
        throw err;
      }

      const notifications = drivers.map((driver) => ({
        userId: driver.id,
        title: title.trim(),
        message: message.trim(),
        isRead: false,
      }));

      await Notification.bulkCreate(notifications);

      return res.status(201).json({
        success: true,
        message: `Notification broadcast sent successfully to all ${drivers.length} drivers.`,
      });
    } else {
      if (isNaN(Number(driverId))) {
        const err = new Error("Invalid driver ID.");
        err.statusCode = 400;
        throw err;
      }

      const driver = await User.findOne({
        where: { id: driverId, role: "delivery" },
      });

      if (!driver) {
        const err = new Error("Specified delivery driver not found.");
        err.statusCode = 404;
        throw err;
      }

      const notification = await Notification.create({
        userId: driver.id,
        title: title.trim(),
        message: message.trim(),
        isRead: false,
      });

      return res.status(201).json({
        success: true,
        message: `Notification sent successfully to driver: ${driver.name}.`,
        notification,
      });
    }
  } catch (error) {
    return handleApiError(error, req, res, "NotificationController.sendNotification");
  }
};

/**
 * Driver action: Retrieve notifications for the logged-in driver
 * GET /api/delivery/notifications
 */
exports.getMyNotifications = async (req, res) => {
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
    return handleApiError(error, req, res, "NotificationController.getMyNotifications");
  }
};

/**
 * Driver action: Mark a notification as read
 * PATCH /api/delivery/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid notification ID.");
      err.statusCode = 400;
      throw err;
    }

    const notification = await Notification.findOne({
      where: { id, userId: driverId },
    });

    if (!notification) {
      const err = new Error("Notification not found.");
      err.statusCode = 404;
      throw err;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    return handleApiError(error, req, res, "NotificationController.markAsRead");
  }
};

/**
 * Driver action: Clear all notifications
 * DELETE /api/delivery/notifications/clear-all
 */
exports.clearNotifications = async (req, res) => {
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
    return handleApiError(error, req, res, "NotificationController.clearNotifications");
  }
};

/**
 * Driver action: Delete a single notification
 * DELETE /api/delivery/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      const err = new Error("Invalid notification ID.");
      err.statusCode = 400;
      throw err;
    }

    const notification = await Notification.findOne({
      where: { id, userId: driverId },
    });

    if (!notification) {
      const err = new Error("Notification not found.");
      err.statusCode = 404;
      throw err;
    }

    await notification.destroy();

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error, req, res, "NotificationController.deleteNotification");
  }
};
