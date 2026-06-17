require("dotenv").config();
const app = require("./app");
const User = require("./models/User");

const { testDbConnection, sequelize } = require("./config/db");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await testDbConnection();

  if (process.env.DB_SYNC === "true") {
    try {
      console.log("[DATABASE]: Syncing schemas...");
      await sequelize.sync({ alter: true });
      console.log("🟢 [DATABASE]: Schemas synced successfully.");
    } catch (err) {
      console.error(
        "🔴 [DATABASE]: Schema sync failed:",
        err.message
      );
      process.exit(1);
    }
  }

  // ✅ Run after sync
  await createDefaultAdmin();

  const server = app.listen(PORT, () => {
    console.log(
      `🚀 [GriVA Backend] Server is running on port ${PORT}`
    );
  });
};

const createDefaultAdmin = async () => {
  const existingAdmin = await User.findOne({
    where: {
        email: process.env.ADMIN_EMAIL,
    },
  });

  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("✅ Default admin created");
  }
};

startServer();


