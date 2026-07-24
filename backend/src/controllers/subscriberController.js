/**
 * SUBSCRIBER CONTROLLER (subscriberController.js)
 */

const Subscriber = require("../models/Subscriber");
const brevoService = require("../services/brevoService");
const { emitToRoles } = require("../socket/socket");
const handleApiError = require("../utils/errorHandler");

/**
 * Load all subscribers (Admin protected)
 */
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    return handleApiError(error, req, res, "SubscriberController.getSubscribers");
  }
};

/**
 * Register a new email subscription (Public)
 */
exports.subscribe = async (req, res) => {
  try {
    const { email, country } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      const err = new Error("Email is required.");
      err.statusCode = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      const err = new Error("Invalid email format.");
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already registered
    const existing = await Subscriber.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      const err = new Error("Email is already subscribed to newsletters.");
      err.statusCode = 409;
      throw err;
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    const joinedDate = new Date().toLocaleDateString("en-US", options);

    const subscriber = await Subscriber.create({
      email: normalizedEmail,
      joinedDate,
      country: country || "Qatar",
    });

    brevoService.sendSubscriberWelcomeEmail(normalizedEmail).catch(err => console.error("Welcome email failed:", err));
    brevoService.sendAdminNewSubscriberNotification(normalizedEmail, country || "Qatar").catch(err => console.error("Admin subscriber notification failed:", err));

    try {
      emitToRoles(["admin", "staff"], "new-subscriber", {
        email: subscriber.email,
        joinedDate: subscriber.joinedDate,
        country: subscriber.country,
      });
    } catch (socketErr) {
      console.error("Failed to emit new-subscriber socket event:", socketErr);
    }

    res.status(201).json({
      success: true,
      message: "Subscribed successfully!",
      subscriber,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubscriberController.subscribe");
  }
};

exports.broadcast = async (req, res) => {
  try {
    const { subject, message, target = "all", targetEmail } = req.body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      const err = new Error("Broadcast subject is required.");
      err.statusCode = 400;
      throw err;
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      const err = new Error("Broadcast message body is required.");
      err.statusCode = 400;
      throw err;
    }

    let subscribers = [];

    if (target === "individual") {
      if (!targetEmail || typeof targetEmail !== "string" || !targetEmail.trim()) {
        const err = new Error("Individual target email is required.");
        err.statusCode = 400;
        throw err;
      }
      subscribers = [{ email: targetEmail.trim() }];
    } else if (target === "new_7_days") {
      const { Op } = require("sequelize");
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      subscribers = await Subscriber.findAll({
        where: {
          createdAt: {
            [Op.gte]: sevenDaysAgo,
          },
        },
      });
    } else if (target === "recent_24_hours") {
      const { Op } = require("sequelize");
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      subscribers = await Subscriber.findAll({
        where: {
          createdAt: {
            [Op.gte]: oneDayAgo,
          },
        },
      });
    } else {
      subscribers = await Subscriber.findAll();
    }

    const count = subscribers.length;

    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: "No subscribers found matching the target criteria.",
        recipientCount: 0,
      });
    }

    const formattedHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #ff6a00;">
          <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 12px; border-radius: 8px;" />
        </div>
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">${subject}</h2>
        <div style="color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px;">${message}</div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <div style="text-align: center; color: #9ca3af; font-size: 11px;">
          <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
          <p>You received this email because you subscribed to our newsletter. If you wish to unsubscribe, please reply to this email with "Unsubscribe".</p>
        </div>
      </div>
    `;

    console.log(`✉️ [NEWSLETTER BROADCAST]: Starting dispatch of "${subject}" to ${count} subscribers...`);

    let successCount = 0;
    for (const sub of subscribers) {
      try {
        await brevoService.sendBroadcastEmail(sub.email, subject, formattedHtml);
        successCount++;
      } catch (err) {
        console.error(`Failed to send broadcast email to ${sub.email}:`, err.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Broadcast completed successfully. Dispatched to ${successCount} of ${count} subscribers.`,
      recipientCount: successCount,
    });
  } catch (error) {
    return handleApiError(error, req, res, "SubscriberController.broadcast");
  }
};
