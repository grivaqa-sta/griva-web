/**
 * SUBSCRIBER CONTROLLER (subscriberController.js)
 */

const Subscriber = require("../models/Subscriber");
const brevoService = require("../services/brevoService");
const { emitToRoles } = require("../socket/socket");

/**
 * Load all subscribers (Admin protected)
 */
exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json({ subscribers });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new email subscription (Public)
 */
exports.subscribe = async (req, res, next) => {
  try {
    const { email, country } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Check if already registered
    const existing = await Subscriber.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email is already subscribed to newsletters." });
    }

    // Generate readable joined date, e.g., "June 09, 2026"
    const options = { year: "numeric", month: "long", day: "numeric" };
    const joinedDate = new Date().toLocaleDateString("en-US", options);

    const subscriber = await Subscriber.create({
      email,
      joinedDate,
      country: country || "Qatar",
    });

    // Send confirmation and admin notification email asynchronously (don't block client response)
    brevoService.sendSubscriberWelcomeEmail(email).catch(err => console.error("Welcome email failed:", err));
    brevoService.sendAdminNewSubscriberNotification(email, country || "Qatar").catch(err => console.error("Admin subscriber notification failed:", err));

    // Notify connected admin dashboard sockets
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
      message: "Subscribed successfully!",
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

exports.broadcast = async (req, res, next) => {
  try {
    const { subject, message, target = "all", targetEmail } = req.body;

    if (!subject || subject.trim() === "") {
      return res.status(400).json({ error: "Broadcast subject is required." });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Broadcast message body is required." });
    }

    let subscribers = [];

    if (target === "individual") {
      if (!targetEmail || targetEmail.trim() === "") {
        return res.status(400).json({ error: "Individual target email is required." });
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
      // Default: "all"
      subscribers = await Subscriber.findAll();
    }

    const count = subscribers.length;

    if (count === 0) {
      return res.status(200).json({
        message: "No subscribers found matching the target criteria.",
        recipientCount: 0,
      });
    }

    // Format plain text to HTML with beautiful GRIVA email brand layout
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

    // Dispatch emails to all subscribers asynchronously
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
      message: `Broadcast completed successfully. Dispatched to ${successCount} of ${count} subscribers.`,
      recipientCount: successCount,
    });
  } catch (error) {
    next(error);
  }
};
