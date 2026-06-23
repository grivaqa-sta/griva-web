const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

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

module.exports = {
  sendTestEmail,
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
};