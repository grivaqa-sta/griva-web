const { BrevoClient } = require("@getbrevo/brevo");
const fs = require("fs");
const path = require("path");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const logEmailResult = (type, email, status, details) => {
  try {
    const logPath = path.resolve(__dirname, "../../email_logs.txt");
    const logLine = `[${new Date().toISOString()}] TYPE: ${type} | TO: ${email} | STATUS: ${status} | DETAILS: ${JSON.stringify(details)}\n`;
    fs.appendFileSync(logPath, logLine);
  } catch (err) {
    console.error("Failed to write email log:", err);
  }
};

const sendTestEmail = async () => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL,
        },
      ],
      subject: "Brevo Test Email",
      htmlContent: `
        <h2>Brevo Test Successful</h2>
        <p>Your Brevo integration is working correctly.</p>
      `,
    };

    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Brevo Error:", error);
    throw error;
  }
};

const sendAdminOrderNotification = async (order) => {
  try {

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },

      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL,
        },
      ],

      subject: `New Order Received - ${order.order_number}`,

      htmlContent: `
        <h2>New Order Received</h2>

        <p><strong>Order Number:</strong> ${order.order_number}</p>

        <p><strong>Customer Name:</strong> ${order.customer_name}</p>

        <p><strong>Customer Phone:</strong> ${order.customer_phone}</p>

        <p><strong>Total Amount:</strong> ${order.total_price}</p>

        <p><strong>Payment Method:</strong> Cash On Delivery</p>
      `,
    };

    const result =
      await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

    return result;

  } catch (error) {
    console.error("Admin notification error:", error);
    throw error;
  }
};
const sendCustomerOrderConfirmation = async (
  order,
  productCount,
  totalQuantity
) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },

      to: [
        {
          email: order.customer_email,
        },
      ],

      subject: `Order Confirmation - ${order.order_number}`,

      htmlContent: `
        <h2>Order Confirmed ✅</h2>

        <p>Hello ${order.customer_name},</p>

        <p>Thank you for your order. We have successfully received it.</p>

        <hr>

        <p><strong>Order Number:</strong> ${order.order_number}</p>

        <p><strong>Products Ordered:</strong> ${productCount}</p>

        <p><strong>Total Quantity:</strong> ${totalQuantity}</p>

        <p><strong>Total Amount:</strong> ${order.total_price}</p>

        <p><strong>Payment Method:</strong> Cash On Delivery</p>

        <hr>

        <p>We will notify you again when your order is shipped.</p>

        <p>Thank you for shopping with us.</p>
      `,
    };

    return await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

  } catch (error) {
    console.error("Customer confirmation email error:", error);
    throw error;
  }
};

const sendOutForDeliveryEmail = async (order) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },

      to: [
        {
          email: order.customer_email,
        },
      ],

      subject: `Your Order ${order.order_number} Is Out For Delivery`,

      htmlContent: `
        <h2>Your Order Is Out For Delivery 🚚</h2>

<p>Hello ${order.customer_name},</p>

<p>Your order <strong>${order.order_number}</strong> is out for delivery.</p>

<p>Our delivery partner is on the way to your location.</p>

<p>Please keep your phone available for delivery coordination.</p>
      `,
    };

    return await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

  } catch (error) {
    console.error("Shipped email error:", error);
    throw error;
  }
};
const sendOrderDeliveredEmail = async (order) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },

      to: [
        {
          email: order.customer_email,
        },
      ],

      subject: `Your Order ${order.order_number} Has Been Delivered`,

      htmlContent: `
        <h2>Order Delivered Successfully 🎉</h2>

        <p>Hello ${order.customer_name},</p>

        <p>Your order <strong>${order.order_number}</strong> has been delivered successfully.</p>

        <p>Thank you for shopping with us.</p>
      `,
    };

    return await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);

  } catch (error) {
    console.error("Delivered email error:", error);
    throw error;
  }
};

const sendBroadcastEmail = async (email, subject, htmlContent) => {
  try {
    // If BREVO_API_KEY is not configured, simulate success in dev env
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key_here") {
      console.log(`✉️ [SIMULATED EMAIL] To: ${email} | Subject: "${subject}" | Content preview: "${htmlContent.substring(0, 100)}..."`);
      logEmailResult("BROADCAST", email, "SIMULATED", { subject });
      return { messageId: "simulated-id-" + Math.random() };
    }

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL || "support@griva.com",
        name: process.env.SENDER_NAME || "GRIVA Store",
      },
      to: [
        {
          email: email,
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    };

    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("BROADCAST", email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending broadcast email to ${email}:`, error);
    logEmailResult("BROADCAST", email, "ERROR", { message: error.message, stack: error.stack });
    throw error;
  }
};

const sendSubscriberWelcomeEmail = async (email) => {
  try {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key_here") {
      console.log(`✉️ [SIMULATED WELCOME EMAIL] To: ${email}`);
      logEmailResult("WELCOME_EMAIL", email, "SIMULATED", {});
      return { messageId: "simulated-welcome-id-" + Math.random() };
    }

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL || "support@griva.com",
        name: process.env.SENDER_NAME || "GRIVA Store",
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Welcome to the GRIVA Newsletter! 🎉",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #ff6a00;">
            <img src="https://griva-web-chi.vercel.app/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 12px; border-radius: 8px;" />
          </div>
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-align: center;">Welcome to the Family! 🎉</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hello,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Thank you for subscribing to the GRIVA Store newsletter. You are now on the list to receive our latest discount offers, free giveaways, and exclusive deals!</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Stay tuned for our next update.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <div style="text-align: center; color: #9ca3af; font-size: 11px;">
            <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("WELCOME_EMAIL", email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending welcome email to ${email}:`, error);
    logEmailResult("WELCOME_EMAIL", email, "ERROR", { message: error.message, stack: error.stack });
    throw error;
  }
};

const sendAdminNewSubscriberNotification = async (email, country) => {
  try {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key_here") {
      console.log(`✉️ [SIMULATED ADMIN SUBSCRIBER NOTIFICATION] To: ${process.env.ADMIN_NOTIFICATION_EMAIL}`);
      logEmailResult("ADMIN_NOTIFICATION", email, "SIMULATED", { country });
      return { messageId: "simulated-admin-sub-id-" + Math.random() };
    }

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL || "support@griva.com",
        name: process.env.SENDER_NAME || "GRIVA Store",
      },
      to: [
        {
          email: process.env.ADMIN_NOTIFICATION_EMAIL || "bijulalp198@gmail.com",
        },
      ],
      subject: `🔔 New Newsletter Subscriber Joined - ${email}`,
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">New Newsletter Subscriber 🔔</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">A new visitor has subscribed to the GRIVA newsletter list.</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;"><strong>Email:</strong> ${email}</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;"><strong>Country:</strong> ${country}</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;"><strong>Joined Date:</strong> ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      `,
    };

    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("ADMIN_NOTIFICATION", email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending admin subscriber notification for ${email}:`, error);
    logEmailResult("ADMIN_NOTIFICATION", email, "ERROR", { message: error.message, stack: error.stack });
  }
};

module.exports = {
  sendTestEmail,
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendBroadcastEmail,
  sendSubscriberWelcomeEmail,
  sendAdminNewSubscriberNotification,
};