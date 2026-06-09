/**
 * SUBSCRIBER CONTROLLER (subscriberController.js)
 */

const Subscriber = require("../models/Subscriber");

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

    res.status(201).json({
      message: "Subscribed successfully!",
      subscriber,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Simulate email campaign broadcasting (Admin protected)
 */
exports.broadcast = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Broadcast message is required." });
    }

    const subscribers = await Subscriber.findAll();
    const count = subscribers.length;

    // Simulate sending email log prints
    console.log(`✉️ [NEWSLETTER]: Broadcasting to ${count} subscribers. Message: "${message}"`);

    res.status(200).json({
      message: `Simulated broadcast successfully. Sent notifications to ${count} subscribers.`,
      recipientCount: count,
    });
  } catch (error) {
    next(error);
  }
};
