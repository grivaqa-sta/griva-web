[ignoring loop detection]
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const readline = require("readline");
const db = require("../models");
const {
  sequelize,
  OrderItem,
  Order,
  ReturnRequest,
  Review,
  CartItem,
  Cart,
  Address,
  Notification,
  Subscriber,
  User,
  SiteSetting,
  DeliverySlot
} = db;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function cleanTransactions() {
  console.log("\n🧹 Cleaning transactional, order, and customer data...");
  const transaction = await sequelize.transaction();
  try {
    await OrderItem.destroy({ where: {}, force: true, transaction });
    await Order.destroy({ where: {}, force: true, transaction });
    await ReturnRequest.destroy({ where: {}, force: true, transaction });
    await CartItem.destroy({ where: {}, force: true, transaction });
    await Cart.destroy({ where: {}, force: true, transaction });
    await Address.destroy({ where: {}, force: true, transaction });
    await Review.destroy({ where: {}, force: true, transaction });
    await Notification.destroy({ where: {}, force: true, transaction });
    await Subscriber.destroy({ where: {}, force: true, transaction });

    await User.destroy({
      where: { role: "customer" },
      transaction
    });

    await transaction.commit();
    console.log("✅ Transactional, order, and customer data cleaned successfully!");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Failed to clean transactional data:", error);
  }
}

async function cleanEverything() {
  console.log("\n💥 Performing complete database reset...");
  try {
    await sequelize.sync({ force: true });
    console.log("✅ All tables dropped and re-created.");

    await User.create({
      name: "Admin",
      email: "admin@thegriva.com",
      password: "admin123",
      role: "admin",
      status: "ACTIVE"
    });
    console.log("➕ Default Admin account created: admin@thegriva.com / admin123");

    await SiteSetting.create({
      announcementBarEnabled: true,
      announcementBarText: "Free shipping across Doha for orders over QAR 99!",
      fridaySaleEnabled: true,
      whatsappNumber: "+97455551234",
      supportEmail: "support@thegriva.com",
      shippingFee: 10.00,
      freeShippingThreshold: 99.00,
    });
    console.log("➕ Default Site settings configured.");

    const slots = [
      { name: "09:00 AM - 12:00 PM", start_time: "09:00 AM", end_time: "12:00 PM", is_active: true, sort_order: 1 },
      { name: "12:00 PM - 03:00 PM", start_time: "12:00 PM", end_time: "03:00 PM", is_active: true, sort_order: 2 },
      { name: "03:00 PM - 06:00 PM", start_time: "03:00 PM", end_time: "06:00 PM", is_active: true, sort_order: 3 },
      { name: "06:00 PM - 09:00 PM", start_time: "06:00 PM", end_time: "09:00 PM", is_active: true, sort_order: 4 }
    ];
    await DeliverySlot.bulkCreate(slots);
    console.log("➕ Default delivery slots seeded.");

    console.log("✅ Database reset and core seed completed successfully!");
  } catch (error) {
    console.error("❌ Failed to perform database reset:", error);
  }
}

async function main() {
  console.log("=========================================");
  console.log("       GRIVA DATABASE CLEAN TOOL         ");
  console.log("=========================================");
  console.log("Choose clean mode:");
  console.log("1. Clean Transactions & Customers only (Keep Products & Catalog)");
  console.log("2. Clean Everything (Wipe out all tables, seed default admin only)");
  console.log("3. Exit");
  
  const choice = await askQuestion("\nEnter choice (1, 2, or 3): ");
  
  if (choice === "1") {
    const confirm = await askQuestion("⚠️ Are you sure you want to delete all orders and customer data? (yes/no): ");
    if (confirm.toLowerCase() === "yes") {
      await cleanTransactions();
    } else {
      console.log("Operation cancelled.");
    }
  } else if (choice === "2") {
    const confirm = await askQuestion("🚨 WARNING: This will drop ALL tables and wipe out all data (including products)! Are you absolutely sure? (yes/no): ");
    if (confirm.toLowerCase() === "yes") {
      await cleanEverything();
    } else {
      console.log("Operation cancelled.");
    }
  } else {
    console.log("Exiting database clean tool.");
  }
  
  rl.close();
  process.exit(0);
}

main();
