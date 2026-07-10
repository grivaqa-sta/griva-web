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
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <!-- Body -->
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #ff6a00; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">New Order</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">🔔 New Order Received</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">A customer has just placed a new order on your store.</p>
              <!-- Order Details Card -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Order Number</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Customer Name</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.customer_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Customer Phone</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.customer_phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Total Amount</td>
                    <td style="padding: 10px 0; color: #ff6a00; font-size: 15px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.total_price}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Payment Method</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">Cash On Delivery</td>
                  </tr>
                </table>
              </div>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">Received on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GRIVA. All rights reserved.</p>
            </div>
          </div>
        </div>
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
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <!-- Body -->
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmed</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Order Confirmed ✅</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">Your order has been successfully placed and is being prepared.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${order.customer_name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Thank you for your order! We have received it and are getting things ready for you. Here's a summary of your purchase:</p>
              <!-- Order Summary Card -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Order Number</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Products Ordered</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${productCount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Total Quantity</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${totalQuantity}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Total Amount</td>
                    <td style="padding: 10px 0; color: #ff6a00; font-size: 15px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.total_price}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Payment Method</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">Cash On Delivery</td>
                  </tr>
                </table>
              </div>
              <!-- Info Box -->
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 28px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">📦 We will notify you via email once your order is shipped and out for delivery.</p>
              </div>
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="${process.env.FRONTEND_URL || 'https://thegriva.com'}" 
                   style="background-color: #ff6a00; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; letter-spacing: 0.3px;">Continue Shopping</a>
              </div>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; text-align: center; margin-top: 24px;">Thank you for choosing <strong>GRIVA</strong>! 🖤</p>
            </div>
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GRIVA. All rights reserved.</p>
            </div>
          </div>
        </div>
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
    const frontendUrl = process.env.FRONTEND_URL || "https://thegriva.com";
    const trackUrl = `${frontendUrl}/track-order?order=${encodeURIComponent(order.order_number || "")}&phone=${encodeURIComponent(order.customer_phone || "")}`;

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
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <!-- Body -->
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #2563eb; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Out For Delivery</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Your Order Is On Its Way! 🚚</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">Our delivery partner is heading to your location right now.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${order.customer_name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Great news! Your order has been picked up and is currently on its way to you. Here are your order details:</p>
              <!-- Order Details Card -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Order Number</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Status</td>
                    <td style="padding: 10px 0; color: #2563eb; font-size: 13px; font-weight: 700; text-align: right;">Out For Delivery</td>
                  </tr>
                </table>
              </div>
              <!-- Info Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 28px;">
                <p style="color: #1e40af; font-size: 13px; margin: 0; line-height: 1.6;">📱 Please keep your phone available for delivery coordination. Our partner may call to confirm directions.</p>
              </div>
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="${trackUrl}" 
                   style="background-color: #ff6a00; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; letter-spacing: 0.3px;">Track Your Order</a>
              </div>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; text-align: center; margin-top: 24px;">Thank you for choosing <strong>GRIVA</strong>! 🖤</p>
            </div>
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GRIVA. All rights reserved.</p>
            </div>
          </div>
        </div>
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
    const reviewUrl = `${process.env.FRONTEND_URL || "https://thegriva.com"}/reviews/order/${order.order_number}`;

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
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <!-- Header -->
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <!-- Body -->
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Delivered</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Order Delivered 🎉</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">Your order has been successfully delivered to your doorstep.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${order.customer_name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Your order <strong>${order.order_number}</strong> has been successfully delivered. We hope you are loving your new products!</p>
              <!-- Order Details Card -->
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Order Number</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Status</td>
                    <td style="padding: 10px 0; color: #059669; font-size: 13px; font-weight: 700; text-align: right;">Delivered ✅</td>
                  </tr>
                </table>
              </div>
              <!-- Info Box -->
              <div style="background-color: #ecfdf5; border-left: 4px solid #059669; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 28px;">
                <p style="color: #065f46; font-size: 13px; margin: 0; line-height: 1.6;">⭐ Please take a moment to rate your delivery experience and the items you received. Your feedback helps us keep our services premium.</p>
              </div>
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="${reviewUrl}" 
                   style="background-color: #ff6a00; color: #ffffff; padding: 13px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block; letter-spacing: 0.3px;">Rate Your Experience</a>
              </div>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; text-align: center; margin-top: 24px;">Thank you for choosing <strong>GRIVA</strong>! 🖤</p>
            </div>
            <!-- Footer -->
            <div style="text-align: center; padding: 20px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GRIVA. All rights reserved.</p>
            </div>
          </div>
        </div>
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
            <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 12px; border-radius: 8px;" />
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

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    if (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "your_brevo_api_key_here") {
      console.log(`✉️ [SIMULATED RESET EMAIL] To: ${email} | URL: ${resetUrl}`);
      logEmailResult("PASSWORD_RESET", email, "SIMULATED", { resetUrl });
      return { messageId: "simulated-reset-id-" + Math.random() };
    }

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL || "support@thegriva.com",
        name: process.env.SENDER_NAME || "GRIVA Store",
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Reset Your Password - GRIVA Store",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 2px solid #ff6a00;">
            <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 12px; border-radius: 8px;" />
          </div>
          <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px; text-align: center;">Reset Your Password</h2>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">Hello ${name || "Customer"},</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">You are receiving this email because you (or someone else) requested a password reset for your account on the GRIVA Store.</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Please click the button below to choose a new password. This link is only valid for 15 minutes.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #ff6a00; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6;">If the button above does not work, copy and paste the following URL into your web browser:</p>
          <p style="color: #ff6a00; font-size: 12px; word-break: break-all; margin-bottom: 24px;">${resetUrl}</p>

          <p style="color: #374151; font-size: 14px; line-height: 1.6;">If you did not request a password reset, please ignore this email; your password will remain unchanged.</p>
          
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <div style="text-align: center; color: #9ca3af; font-size: 11px;">
            <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("PASSWORD_RESET", email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending password reset email to ${email}:`, error);
    logEmailResult("PASSWORD_RESET", email, "ERROR", { message: error.message, stack: error.stack });
    throw error;
  }
};

const sendReturnRequestSubmittedEmail = async (request, user, orderNumber) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: `Return Request Submitted - Order ${orderNumber}`,
      htmlContent: `
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Under Review</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Return Request Received</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">We have received your return request and our support team is reviewing it.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Your return request for order <strong>${orderNumber}</strong> has been successfully submitted. We will inspect the details and get back to you shortly.</p>
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">#${request.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Request Type</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${request.type}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Reason</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb; text-transform: capitalize;">${request.reason.replace("_", " ")}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Status</td>
                    <td style="padding: 10px 0; color: #d97706; font-size: 13px; font-weight: 700; text-align: right;">Pending Review ⏳</td>
                  </tr>
                </table>
              </div>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <div style="text-align: center; color: #9ca3af; font-size: 11px;">
                <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      `,
    };
    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("RETURN_SUBMITTED", user.email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending return submission email to ${user.email}:`, error);
    logEmailResult("RETURN_SUBMITTED", user.email, "ERROR", { message: error.message });
  }
};

const sendReturnRequestApprovedEmail = async (request, user, orderNumber, detailText) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: `Return Request Approved! - Order ${orderNumber}`,
      htmlContent: `
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Approved</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Return Request Approved 🎉</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">Your return request has been approved and processed.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Good news! Your return request for order <strong>${orderNumber}</strong> has been approved.</p>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #059669; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 28px;">
                <p style="color: #065f46; font-size: 14px; margin: 0; line-height: 1.6; font-weight: 600;">Action Details:</p>
                <p style="color: #047857; font-size: 13px; margin: 6px 0 0; line-height: 1.6;">${detailText}</p>
              </div>

              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Request ID</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right; border-bottom: 1px solid #e5e7eb;">#${request.id}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Resolved Status</td>
                    <td style="padding: 10px 0; color: #059669; font-size: 13px; font-weight: 700; text-align: right; text-transform: capitalize;">${request.status.replace("_", " ")}</td>
                  </tr>
                </table>
              </div>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <div style="text-align: center; color: #9ca3af; font-size: 11px;">
                <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      `,
    };
    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("RETURN_APPROVED", user.email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending return approval email to ${user.email}:`, error);
    logEmailResult("RETURN_APPROVED", user.email, "ERROR", { message: error.message });
  }
};

const sendReturnRequestRejectedEmail = async (request, user, orderNumber, reasonText) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDER_EMAIL,
        name: process.env.SENDER_NAME,
      },
      to: [
        {
          email: user.email,
        },
      ],
      subject: `Update on your Return Request - Order ${orderNumber}`,
      htmlContent: `
        <div style="background-color: #1a1a2e; padding: 40px 20px; width: 100%;">
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.15);">
            <div style="text-align: center; padding: 28px 32px 20px; border-bottom: 3px solid #ff6a00;">
              <img src="https://thegriva.com/images/logo-light.png" alt="GRIVA Logo" style="height: 35px; width: auto; background-color: #000; padding: 8px 14px; border-radius: 8px;" />
            </div>
            <div style="padding: 32px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">Rejected</span>
              </div>
              <h2 style="color: #111827; font-size: 22px; font-weight: 700; margin: 0 0 8px; text-align: center;">Return Request Rejected</h2>
              <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0 0 28px;">Your return request has been reviewed and could not be approved.</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7;">Hello <strong>${user.name}</strong>,</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">Your return request for order <strong>${orderNumber}</strong> has been reviewed. Unfortunately, we were unable to approve it.</p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 28px;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6; font-weight: 600;">Reason for Rejection:</p>
                <p style="color: #b91c1c; font-size: 13px; margin: 6px 0 0; line-height: 1.6;">${reasonText || "Does not comply with our e-commerce return policy rules."}</p>
              </div>

              <p style="color: #374151; font-size: 13px; line-height: 1.6;">If you have any questions or would like to submit further information, please contact our support chat.</p>

              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <div style="text-align: center; color: #9ca3af; font-size: 11px;">
                <p>© ${new Date().getFullYear()} GRIVA Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      `,
    };
    const result = await client.transactionalEmails.sendTransacEmail(sendSmtpEmail);
    logEmailResult("RETURN_REJECTED", user.email, "SUCCESS", result);
    return result;
  } catch (error) {
    console.error(`Error sending return rejection email to ${user.email}:`, error);
    logEmailResult("RETURN_REJECTED", user.email, "ERROR", { message: error.message });
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
  sendPasswordResetEmail,
  sendReturnRequestSubmittedEmail,
  sendReturnRequestApprovedEmail,
  sendReturnRequestRejectedEmail,
};