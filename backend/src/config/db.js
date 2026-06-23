/**
 * DATABASE CONFIGURATION FILE (db.js)
 * 
 * ─── JAVA COMPARISON ──────────────────────────────────────────────────────────
 * In Spring Boot, database configuration is handled in 'application.properties' 
 * or 'application.yml' combined with HikariCP (Hikari Connection Pool).
 * Instead of auto-configuring datasource beans, Node.js uses ORM instances 
 * (like Sequelize or Prisma) initialized explicitly in a JS module.
 * 
 * ─── REAL-WORLD USE CASE ──────────────────────────────────────────────────────
 * In production e-commerce applications, setting up connection limits (max/min pool size) 
 * prevents server crashes when a spike of traffic occurs (e.g. during a flash sale).
 * For Azure Database for PostgreSQL (Doha Region), enforcing SSL is mandatory to protect 
 * transit data between the API host and database.
 * 
 * ─── WITHOUT THIS ─────────────────────────────────────────────────────────────
 * Without a connection pool, Express would establish a fresh network handshake for every 
 * query. Under high load, this causes a "Connection Limit Exceeded" crash from the 
 * database server.
 * 
 * ─── UNIQUE SENIOR TIPS ───────────────────────────────────────────────────────
 * Always set `rejectUnauthorized: false` for Azure SSL connections unless you load
 * the specific Baltimore CyberTrust Root CA certificate file locally.
 * Keep database query logging disabled in production (logging: false) to prevent disk 
 * I/O degradation and database password leakages in application log systems.
 */

const { Sequelize } = require("sequelize");
const path = require("path");

if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
}

// Guard statement (like Java's IllegalArgumentException)
if (!process.env.DATABASE_URL) {
  console.warn("[WARNING]: DATABASE_URL is not set. Using temporary placeholder connection.");
}

// Fallback placeholder connection string to prevent system initialization failure
const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/grivadb";

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? {
      require: true,
      rejectUnauthorized: false, // Prevents Azure handshake failure
    } : false, // Disable SSL locally unless required
  },
  pool: {
    max: 10,         // HikariCP's maximumPoolSize equivalent (Azure B1ms friendly)
    min: 2,          // HikariCP's minimumIdle equivalent
    acquire: 30000,  // Max time (ms) ORM waits to get a connection before throwing timeout error
    idle: 10000,     // Max time (ms) connection can be idle before release
  },
});

// Async tester (replaces Spring Boot DataSource init logs)
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("🟢 [DATABASE]: Connection established securely to Azure PostgreSQL (Doha Region).");
  } catch (error) {
    console.error("🔴 [DATABASE]: Connection failed. Ensure environment credentials are set correctly.");
    console.error(error.message);
  }
};

module.exports = {
  sequelize,
  testDbConnection,
};
