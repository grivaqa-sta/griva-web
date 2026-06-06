require("dotenv").config();
const app = require("./app");

const { testDbConnection, sequelize } = require("./config/db");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  // Test connection to Azure Postgres (Doha Region)
  await testDbConnection();

  // Replaces Spring Boot schema auto-creation (ddl-auto: update)
  // In development, you can set DB_SYNC=true in .env to sync schema changes.
  if (process.env.DB_SYNC === "true") {
    try {
      console.log("[DATABASE]: Syncing schemas...");
      await sequelize.sync({ alter: true }); // equivalent to Hibernate update schema
      console.log("🟢 [DATABASE]: Schemas synced successfully.");
    } catch (err) {
      console.error("🔴 [DATABASE]: Schema sync failed:", err.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 [GriVA Backend] Server is running on port ${PORT}`);
  });

  // Handle graceful shutdowns (Tomcat Context destruction equivalent)
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  });
};

startServer();


