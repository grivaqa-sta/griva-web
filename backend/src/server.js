const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const app = require("./app");
const User = require("./models/User");

const { testDbConnection, sequelize } = require("./config/db");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await testDbConnection();

  if (process.env.DB_SYNC === "true") {
    try {
      // Safely alter the ENUM role type in PostgreSQL if it exists
      try {
        await sequelize.query("ALTER TYPE \"enum_Users_role\" ADD VALUE IF NOT EXISTS 'staff'");
        console.log("🟢 [DATABASE]: Altered role ENUM type if PostgreSQL to support 'staff'");
      } catch (enumErr) {
        console.log("ℹ️ [DATABASE]: Skipping raw ENUM alteration (type may not exist or not PostgreSQL):", enumErr.message);
      }

      // Safely add printing tracking columns to Orders table if they don't exist
      try {
        await sequelize.query("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS is_printed BOOLEAN DEFAULT false;");
        await sequelize.query("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS printed_at TIMESTAMP WITH TIME ZONE;");
        await sequelize.query("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS checkout_token VARCHAR(255);");
        console.log("🟢 [DATABASE]: Added is_printed, printed_at and checkout_token columns to Orders table");
      } catch (printColErr) {
        console.log("ℹ️ [DATABASE]: Skipping raw Orders column addition:", printColErr.message);
      }

      // Safely drop NOT NULL constraint on OrderItems product_id so deleting products is allowed
      try {
        await sequelize.query("ALTER TABLE \"OrderItems\" ALTER COLUMN \"product_id\" DROP NOT NULL;");
        console.log("🟢 [DATABASE]: Dropped NOT NULL constraint on OrderItems.product_id");
      } catch (dropNotNullErr) {
        console.log("ℹ️ [DATABASE]: Skipping DROP NOT NULL on OrderItems.product_id:", dropNotNullErr.message);
      }

      // Safely add deal_of_day column to products table if it doesn't exist
      try {
        await sequelize.query("ALTER TABLE \"products\" ADD COLUMN IF NOT EXISTS deal_of_day BOOLEAN DEFAULT false;");
        console.log("🟢 [DATABASE]: Added deal_of_day column to products table");
      } catch (dodColErr) {
        console.log("ℹ️ [DATABASE]: Skipping raw products column addition:", dodColErr.message);
      }

      // Safely alter Reviews foreign key to cascade delete
      try {
        await sequelize.query("ALTER TABLE \"Reviews\" DROP CONSTRAINT IF EXISTS \"Reviews_product_id_fkey\";");
        await sequelize.query("ALTER TABLE \"Reviews\" ADD CONSTRAINT \"Reviews_product_id_fkey\" FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"id\") ON DELETE CASCADE;");
        console.log("🟢 [DATABASE]: Updated Reviews_product_id_fkey to ON DELETE CASCADE");
      } catch (revErr) {
        console.log("ℹ️ [DATABASE]: Skipping Reviews constraint update:", revErr.message);
      }

      // Safely alter CartItems foreign key to cascade delete
      try {
        await sequelize.query("ALTER TABLE \"CartItems\" DROP CONSTRAINT IF EXISTS \"CartItems_product_id_fkey\";");
        await sequelize.query("ALTER TABLE \"CartItems\" ADD CONSTRAINT \"CartItems_product_id_fkey\" FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"id\") ON DELETE CASCADE;");
        console.log("🟢 [DATABASE]: Updated CartItems_product_id_fkey to ON DELETE CASCADE");
      } catch (cartErr) {
        console.log("ℹ️ [DATABASE]: Skipping CartItems constraint update:", cartErr.message);
      }

      // Safely alter ProductImages foreign key to cascade delete
      try {
        await sequelize.query("ALTER TABLE \"ProductImages\" DROP CONSTRAINT IF EXISTS \"ProductImages_product_id_fkey\";");
        await sequelize.query("ALTER TABLE \"ProductImages\" ADD CONSTRAINT \"ProductImages_product_id_fkey\" FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"id\") ON DELETE CASCADE;");
        console.log("🟢 [DATABASE]: Updated ProductImages_product_id_fkey to ON DELETE CASCADE");
      } catch (imgErr) {
        console.log("ℹ️ [DATABASE]: Skipping ProductImages constraint update:", imgErr.message);
      }

      // Safely alter FlashSaleProducts foreign key to cascade delete
      try {
        await sequelize.query("ALTER TABLE \"FlashSaleProducts\" DROP CONSTRAINT IF EXISTS \"FlashSaleProducts_product_id_fkey\";");
        await sequelize.query("ALTER TABLE \"FlashSaleProducts\" ADD CONSTRAINT \"FlashSaleProducts_product_id_fkey\" FOREIGN KEY (\"product_id\") REFERENCES \"products\" (\"id\") ON DELETE CASCADE;");
        console.log("🟢 [DATABASE]: Updated FlashSaleProducts_product_id_fkey to ON DELETE CASCADE");
      } catch (flashErr) {
        console.log("ℹ️ [DATABASE]: Skipping FlashSaleProducts constraint update:", flashErr.message);
      }

      console.log("[DATABASE]: Syncing schemas...");
      await sequelize.sync();
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

startServer(); // trigger nodemon restart



