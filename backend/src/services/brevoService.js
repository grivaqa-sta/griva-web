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

module.exports = {
  sendTestEmail,
};