const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";
const app = require("./app"); // Core express application
const User = require("./models/User");

const { testDbConnection, sequelize } = require("./config/db");

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await testDbConnection();

  // Run critical migrations unconditionally regardless of DB_SYNC
  try {
    await sequelize.query('ALTER TABLE "ReturnRequests" ADD COLUMN IF NOT EXISTS "delivery_boy_id" INTEGER REFERENCES "Users" ("id") ON DELETE SET NULL;');
    await sequelize.query('ALTER TABLE "ReturnRequests" ALTER COLUMN "status" TYPE VARCHAR(50);');
    console.log('🟢 [DATABASE]: Unconditionally ensured delivery_boy_id and status type VARCHAR(50) exist in ReturnRequests table');
  } catch (dbErr) {
    console.log('ℹ️ [DATABASE]: Skipping unconditional ReturnRequests table alteration:', dbErr.message);
  }

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
        await sequelize.query("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS delivery_payment_method VARCHAR(255);");
        await sequelize.query("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS cash_reconciliation_status VARCHAR(255) DEFAULT 'not_applicable';");
        console.log("🟢 [DATABASE]: Added is_printed, printed_at, checkout_token, delivery_payment_method, and cash_reconciliation_status columns to Orders table");
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

      // Safely add delivery_rating and delivery_comment to Orders table if they do not exist
      try {
        await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "delivery_rating" INTEGER;');
        await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "delivery_comment" TEXT;');
        await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 8);');
        await sequelize.query('ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11, 8);');
        console.log('🟢 [DATABASE]: Ensured delivery_rating, delivery_comment, latitude and longitude columns exist in Orders table.');
      } catch (colErr) {
        console.log('ℹ️ [DATABASE]: Skipping Orders column creation:', colErr.message);
      }

      // Safely add latitude and longitude to addresses table if they do not exist
      try {
        await sequelize.query('ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "latitude" DECIMAL(10, 8);');
        await sequelize.query('ALTER TABLE "addresses" ADD COLUMN IF NOT EXISTS "longitude" DECIMAL(11, 8);');
        console.log('🟢 [DATABASE]: Ensured latitude and longitude columns exist in addresses table.');
      } catch (colErr) {
        console.log('ℹ️ [DATABASE]: Skipping addresses coordinates column creation:', colErr.message);
      }

      // Safely add telegramLink and whatsappCommunityLink to SiteSettings table if they do not exist
      try {
        await sequelize.query('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "telegramLink" VARCHAR(255) DEFAULT \'\';');
        await sequelize.query('ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "whatsappCommunityLink" VARCHAR(255) DEFAULT \'\';');
        console.log('🟢 [DATABASE]: Ensured telegramLink and whatsappCommunityLink columns exist in SiteSettings table.');
      } catch (colErr) {
        console.log('ℹ️ [DATABASE]: Skipping SiteSettings columns creation:', colErr.message);
      }

      // Dynamic Variants and Attributes Schema Alters
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS "product_variants" (
            "id" SERIAL PRIMARY KEY,
            "product_id" INTEGER NOT NULL REFERENCES "products" ("id") ON DELETE CASCADE,
            "combination" JSONB NOT NULL,
            "stock" INTEGER NOT NULL DEFAULT 0,
            "sku" VARCHAR(255),
            "price" DECIMAL(10, 2),
            "images" JSONB DEFAULT '[]'::jsonb,
            "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
          );
        `);
        console.log("🟢 [DATABASE]: Ensured product_variants table exists");
      } catch (variantTableErr) {
        console.log("ℹ️ [DATABASE]: Skipping product_variants table creation:", variantTableErr.message);
      }

      try {
        await sequelize.query('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "attributes" JSONB DEFAULT \'[]\'::jsonb;');
        console.log("🟢 [DATABASE]: Ensured attributes column exists in products table");
      } catch (prodColErr) {
        console.log("ℹ️ [DATABASE]: Skipping raw products attributes column addition:", prodColErr.message);
      }

      try {
        await sequelize.query('ALTER TABLE "CartItems" ADD COLUMN IF NOT EXISTS "variant_id" INTEGER REFERENCES "product_variants" ("id") ON DELETE CASCADE;');
        await sequelize.query('ALTER TABLE "CartItems" ADD COLUMN IF NOT EXISTS "selected_attributes" JSONB DEFAULT \'{}\'::jsonb;');
        console.log("🟢 [DATABASE]: Ensured variant_id and selected_attributes columns exist in CartItems table");
      } catch (cartColErr) {
        console.log("ℹ️ [DATABASE]: Skipping CartItems columns addition:", cartColErr.message);
      }

      try {
        await sequelize.query('ALTER TABLE "OrderItems" ADD COLUMN IF NOT EXISTS "variant_id" INTEGER REFERENCES "product_variants" ("id") ON DELETE SET NULL;');
        await sequelize.query('ALTER TABLE "OrderItems" ADD COLUMN IF NOT EXISTS "selected_attributes" JSONB DEFAULT \'{}\'::jsonb;');
        await sequelize.query('ALTER TABLE "OrderItems" ADD COLUMN IF NOT EXISTS "sku" VARCHAR(255);');
        await sequelize.query('ALTER TABLE "OrderItems" ADD COLUMN IF NOT EXISTS "image_snapshot" VARCHAR(255);');
        console.log("🟢 [DATABASE]: Ensured variant_id, selected_attributes, sku, and image_snapshot columns exist in OrderItems table");
      } catch (orderColErr) {
        console.log("ℹ️ [DATABASE]: Skipping OrderItems columns addition:", orderColErr.message);
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
  await migrateLegacyProducts();

  const { initSocket } = require("./socket/socket");
  const server = app.listen(PORT, () => {
    console.log(
      `🚀 [GriVA Backend] Server is running on port ${PORT}`
    );
  });
  initSocket(server);
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

const migrateLegacyProducts = async () => {
  try {
    const Product = require("./models/Product");
    const ProductVariant = require("./models/ProductVariant");

    const products = await Product.findAll();
    for (const p of products) {
      const legacyVariants = p.variants;
      const dynamicAttrs = p.attributes;

      if (Array.isArray(legacyVariants) && legacyVariants.length > 0 && (!Array.isArray(dynamicAttrs) || dynamicAttrs.length === 0)) {
        console.log(`⏳ [MIGRATION]: Migrating legacy variants for product: ${p.title} (ID: ${p.id})`);

        const attrMap = {};
        legacyVariants.forEach(v => {
          Object.keys(v).forEach(k => {
            const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            if (!attrMap[normalizedKey]) {
              attrMap[normalizedKey] = new Set();
            }
            if (v[k]) {
              attrMap[normalizedKey].add(v[k]);
            }
          });
        });

        const attributes = Object.keys(attrMap).map(name => ({
          name,
          values: Array.from(attrMap[name])
        }));

        p.attributes = attributes;
        await p.save();

        const baseStock = p.stock || 0;
        const variantStock = Math.max(1, Math.floor(baseStock / legacyVariants.length));

        for (const v of legacyVariants) {
          const combination = {};
          Object.keys(v).forEach(k => {
            const normalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            combination[normalizedKey] = v[k];
          });

          const existingVariant = await ProductVariant.findOne({
            where: {
              product_id: p.id,
              combination
            }
          });

          if (!existingVariant) {
            const subSku = p.sku ? `${p.sku}-${Object.values(combination).map(val => String(val).toUpperCase().replace(/[^A-Z0-9]/g, '')).join('-')}` : null;
            await ProductVariant.create({
              product_id: p.id,
              combination,
              stock: variantStock,
              sku: subSku
            });
          }
        }
        console.log(`✅ [MIGRATION]: Completed migration for product ID: ${p.id}`);
      }
    }
  } catch (err) {
    console.error("🔴 [MIGRATION]: Legacy products migration failed:", err.message);
  }
};

startServer(); // trigger nodemon restart
// Trigger nodemon restart after disabling DB_SYNC to resolve ECONNRESET



